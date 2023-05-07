import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

    const user = await this.prisma.user.create({
      data: { ...createUserDto, username: newUsername },
      include: { role: true },
    });

    // role.id 대신 role.name을 사용하여 반환
    const role = user.role.name ?? '';

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findAll() {
    return this.prisma.user.findMany();
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
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
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

  async uploadAvatar(userId: number, fileName: string) {
    const avatarUrl = `uploads/${fileName}`;
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    return user;
  }

  async removeAvatar(userId: number) {
    const user = await this.findOneById(userId);
    console.log(user);

    if (user.avatarUrl) {
      const filePath = path.join(
        __dirname,
        'uploads',
        '..',
        '..',
        user.avatarUrl,
      );

      fs.unlinkSync(filePath);
      return await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
      });
    }

    return user;
  }
}
