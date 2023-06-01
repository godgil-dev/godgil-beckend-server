import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { convertUserToResponse } from './utils/response.uitls';
import UserRequest from '../auth/types/user-request.interface';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

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
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });

    return convertUserToResponse(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);

    if (user.avatarUrl) {
      const filePath = path.join(
        __dirname,
        'uploads',
        '..',
        '..',
        user.avatarUrl,
      );
      fs.unlinkSync(filePath);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async uploadAvatar(request: UserRequest, file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    const user = await this.prisma.user.update({
      where: { id: request.user.id },
      data: { avatarUrl: file.location },
      include: { role: true },
    });

    return convertUserToResponse(user);
  }

  //   async deleteS3File(file_dir , file_name)  {
  //     let params = {
  //       Bucket: 'community.bvoat.com',
  //       Key: file_dir.concat('/', file_name)
  //     };

  //     try {
  //       s3.deleteObject(params, function (error, data) {
  //         if (error) {
  //           console.log('err: ', error, error.stack);
  //         } else {
  //           console.log(data, " 정상 삭제 되었습니다.");
  //         }
  //       })
  //     } catch(err) {
  //       console.log(err);
  //       throw err;
  //     }
  // }

  async removeAvatar(userId: number) {
    let user = await this.findOneById(userId);
    const { avatarUrl } = user;

    if (avatarUrl && avatarUrl !== DEFAULT_IMAGE_URL) {
      const fileName = avatarUrl.slice(avatarUrl.lastIndexOf('/') + 1);
      console.log(fileName);

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
