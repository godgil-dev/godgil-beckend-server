import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { convertUserToResponse } from './utils/response.uitls';
import UserRequest from '../auth/types/user-request.interface';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import {
  FILE_ERROR_MESSAGE,
  VALIDATE_ERROR_MESSAGE,
} from './constants/messages';
import { UpdatePasswordDto } from './dto/update-password.dto';

export const roundsOfHashing = 10;
const DEFAULT_IMAGE_URL =
  'https://www.thechooeok.com/common/img/default_profile.png';

@Injectable()
export class UsersService {
  private s3: S3Client;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      signingEscapePath: true,
    });
  }

  exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const usernamePrefix = createUserDto.email.split('@')[0];
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    let suffix = 1;
    let newUsername = usernamePrefix;

    if (existingEmail) {
      throw new ConflictException('이미 존재하는 이메일 주소입니다');
    }

    let count = await this.prisma.user.count({
      where: { username: newUsername },
    });

    while (count > 0) {
      newUsername = `${usernamePrefix}_${suffix.toString().padStart(2, '0')}`;
      count = await this.prisma.user.count({
        where: { username: newUsername },
      });
      suffix++;
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;
    const avatarUrl = createUserDto.avatarUrl || DEFAULT_IMAGE_URL;

    const user = await this.prisma.user.create({
      data: { ...createUserDto, username: newUsername, avatarUrl },
      include: { role: true },
    });

    return convertUserToResponse(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.exclude(user, ['password']));
  }

  findOne(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  findOneById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username !== undefined) {
      const isExists = await this.prisma.user.findFirst({
        where: { username: updateUserDto.username },
      });

      if (isExists) {
        throw new ConflictException(VALIDATE_ERROR_MESSAGE.DUPLICATE_USERNAME);
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });

    return convertUserToResponse(user);
  }

  async updatePassword(
    id: number,
    { password, newPassword }: UpdatePasswordDto,
  ) {
    const user = await this.findOneById(id);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException(VALIDATE_ERROR_MESSAGE.PASSWORD_NOT_MATCH);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        VALIDATE_ERROR_MESSAGE.SAME_AS_THE_OLD_PASSWORD,
      );
    }

    const newHashPassword = await bcrypt.hash(newPassword, roundsOfHashing);

    const updateUser = await this.prisma.user.update({
      where: { id },
      data: { password: newHashPassword },
      include: { role: true },
    });

    return convertUserToResponse(updateUser);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    const { avatarUrl } = user;

    if (avatarUrl && avatarUrl !== DEFAULT_IMAGE_URL) {
      const fileName = avatarUrl.slice(avatarUrl.lastIndexOf('/') + 1);
      const input = {
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: fileName,
      };

      const command = new DeleteObjectCommand(input);
      await this.s3.send(command);
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async uploadAvatar(request: UserRequest, file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException(FILE_ERROR_MESSAGE.FILE_NOT_FOUND);
    }

    const user = await this.prisma.user.update({
      where: { id: request.user.id },
      data: { avatarUrl: file.location },
      include: { role: true },
    });

    return convertUserToResponse(user);
  }

  async removeAvatar(userId: number) {
    let user = await this.findOneById(userId);
    const { avatarUrl } = user;

    if (avatarUrl && avatarUrl !== DEFAULT_IMAGE_URL) {
      const fileName = avatarUrl.slice(avatarUrl.lastIndexOf('/') + 1);
      const input = {
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: fileName,
      };

      const command = new DeleteObjectCommand(input);
      await this.s3.send(command);

      user = await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: DEFAULT_IMAGE_URL },
        include: { role: true },
      });
    }

    return convertUserToResponse(user);
  }

  generateAvatarUrl(request: UserRequest, fileName: string) {
    const host = request.protocol + '://' + request.get('host'); // 호스트 정보 가져오기
    const avatarUrl = `${host}/uploads/${fileName}`; // 아바타 URL 생성

    return avatarUrl;
  }
}
