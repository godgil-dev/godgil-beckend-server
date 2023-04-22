import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
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
import { multerConfig } from './multer-config';
import UserRequest from '../auth/types/user-request.interface';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();

    return users.map((user) => new UserEntity(user));
  }

  @Get()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async findOne(@Req() request: UserRequest) {
    return new UserEntity(await this.usersService.findOneById(request.user.id));
  }

  @Patch()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Req() request: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return new UserEntity(
      await this.usersService.update(request.user.id, updateUserDto),
    );
  }

  @Delete()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async remove(@Req() request: UserRequest) {
    return new UserEntity(await this.usersService.remove(request.user.id));
  }

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
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Req() request: UserRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `uploads/${file.filename}`;
    const user = await this.usersService.update(request.user.id, { avatarUrl });

    return {
      avatarUrl: user.avatarUrl,
    };
  }
}
