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
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Request } from 'express';

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
    @Req() request: Request,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return await this.usersService.uploadAvatar(request, file);
  }

  @Delete('/avatar')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async removeAvatar(@Req() request: Request) {
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
  async findOne(@Req() request: Request) {
    return await this.usersService.findOneById(request.user.id);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(request.user.id, updateUserDto);
  }

  @Patch('/password')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async updatePassword(
    @Req() request: Request,
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
  async remove(@Req() request: Request) {
    await this.usersService.remove(request.user.id);
  }
}
