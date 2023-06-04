import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import UserRequest from '../auth/types/user-request.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() request: UserRequest,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const user = await this.usersService.uploadAvatar(request, file);

    return {
      avatarUrl: user.avatarUrl,
    };
  }

  @Delete('/avatar')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async removeAvatar(@Req() request: UserRequest) {
    const user = await this.usersService.removeAvatar(request.user.id);

    return new UserEntity(user);
  }

  @Post()
  @Public()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();

    return users.map((user) => user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async findOne(@Req() request: UserRequest) {
    return await this.usersService.findOneById(request.user.id);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Req() request: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(request.user.id, updateUserDto);
  }

  @Patch('/password')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async updatePassword(
    @Req() request: UserRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.usersService.updatePassword(
      request.user.id,
      updatePasswordDto,
    );
  }

  @HttpCode(204)
  @Delete()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async remove(@Req() request: UserRequest) {
    await this.usersService.remove(request.user.id);
  }
}
