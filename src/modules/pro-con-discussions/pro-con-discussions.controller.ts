import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProConDiscussionsService } from './pro-con-discussions.service';
import { CreateProConDiscussionDto } from './dto/create-pro-con-discussion.dto';
import { UpdateProConDiscussionDto } from './dto/update-pro-con-discussion.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import UserRequest from 'src/modules/auth/types/user-request.interface';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { OwnershipGuard } from 'src/modules/posts/guards/ownership.guard';
import { AuthService } from '../auth/auth.service';
import { ListProConDiscussionQueryDto } from './dto/list-pro-con-discussion-query.dto';

@ApiTags('pro-con-discussions')
@Controller('pro-con-discussions')
export class ProConDiscussionsController {
  constructor(
    private readonly proConDiscussionsService: ProConDiscussionsService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProConDiscussionDto: CreateProConDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return await this.proConDiscussionsService.create(
      createProConDiscussionDto,
      request.user.id,
    );
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'myPostsOnly', type: Boolean, required: false })
  @Public()
  @Get()
  async findAll(
    @Query() listProConDiscussionQueryDto: ListProConDiscussionQueryDto,
    @Req() request: UserRequest,
  ) {
    const { page, limit, myPostsOnly } = listProConDiscussionQueryDto;
    const offset = (page - 1) * limit;
    const { posts, totalCount } = await this.proConDiscussionsService.findAll({
      limit,
      offset,
      userId: request?.user?.id || -1,
      myPostsOnly,
    });
    return {
      posts,
      pageInfo: {
        page,
        totalCount,
        currentCount: posts.length,
        totalPage: Math.ceil(totalCount / limit),
      },
    };
  }

  @ApiBearerAuth()
  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserRequest,
  ) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = await this.authService.getUserFromToken(token);

    return await this.proConDiscussionsService.findOne(id, user?.id || -1);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProConDiscussionDto: UpdateProConDiscussionDto,
    @Req() request: UserRequest,
  ) {
    return this.proConDiscussionsService.update(
      id,
      updateProConDiscussionDto,
      request.user.id,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(OwnershipGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proConDiscussionsService.remove(id);
  }
}
