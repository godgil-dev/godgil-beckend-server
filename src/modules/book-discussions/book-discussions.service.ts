import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { PostsService } from 'src/modules/posts/posts.service';
import { BooksService } from '../books/books.service';
import { CommentsService } from '../comments/comments.service';

import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { postToResponse, prismaPostInclude } from './utils/postUtils';
import { FindAllByIsbnType, FindAllType } from './types/book-discussion.type';

@Injectable()
export class BookDiscussionsService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
    private bookService: BooksService,
    private commentsService: CommentsService,
  ) {}

  async create(
    createBookDiscussionDto: CreateBookDiscussionDto,
    authorId: number,
  ) {
    const book = await this.bookService.findAndCreateByIsbn(
      createBookDiscussionDto.book,
    );

    const post = await this.prisma.post.create({
      data: {
        authorId,
        title: createBookDiscussionDto.title,
        content: createBookDiscussionDto.content,
        BookDiscussion: {
          create: {
            bookId: book.id,
          },
        },
      },
      include: prismaPostInclude(authorId),
    });

    return { ...postToResponse(post), comments: [] };
  }

  async findAll({
    limit,
    offset,
    userId,
    query = null,
    myPostsOnly = false,
    sortBy = 'lastest',
  }: FindAllType) {
    const queryString = query !== null && {
      title: {
        contains: query,
      },
    };

    const where = {
      NOT: {
        BookDiscussion: null,
      },
      ...queryString,
      ...(myPostsOnly && {
        authorId: userId,
      }),
    };

    const orderByLatest = {
      createdAt: 'desc',
    };

    const orderByPopular = {
      PostLike: {
        _count: 'desc',
      },
    };

    const orderBy =
      { lastest: orderByLatest, popular: orderByPopular }[sortBy] || {};

    const posts = await this.prisma.post.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: prismaPostInclude(userId),
    });

    const totalCount = await this.prisma.post.count({
      where,
    });

    return { posts: posts.map(postToResponse), totalCount };
  }

  async findLikedPosts({
    limit,
    offset,
    userId,
    query = null,
    sortBy = 'lastest',
  }: FindAllType) {
    const queryString = query !== null && {
      title: {
        contains: query,
      },
    };

    const where = {
      NOT: {
        BookDiscussion: null,
      },
      ...queryString,
      PostLike: {
        some: {
          userId,
        },
      },
    };

    const orderByLatest = {
      createdAt: 'desc',
    };

    const orderByPopular = {
      PostLike: {
        _count: 'desc',
      },
    };

    const orderBy =
      { lastest: orderByLatest, popular: orderByPopular }[sortBy] || {};

    const posts = await this.prisma.post.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: prismaPostInclude(userId),
    });

    const totalCount = await this.prisma.post.count({
      where,
    });

    return { posts: posts.map(postToResponse), totalCount };
  }

  async findAllDiscussionsByIsbn({
    userId,
    isbn,
    limit,
    offset,
  }: FindAllByIsbnType) {
    const book = await this.bookService.findOneByIsbn(isbn);

    if (!book) {
      return { posts: [], totalCount: 0 };
    }

    const bookDiscussion = await this.prisma.bookDiscussion.findFirst({
      where: { bookId: book.id },
    });

    if (!bookDiscussion) {
      return { posts: [], totalCount: 0 };
    }

    const posts = await this.prisma.post.findMany({
      where: { id: bookDiscussion.postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: prismaPostInclude(userId),
    });

    return { posts: posts.map(postToResponse), totalCount: posts.length };
  }

  async findOne(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: prismaPostInclude(userId),
    });

    if (!post.BookDiscussion) {
      throw new BadRequestException('독서 토론 형태의 게시물이 아닙니다');
    }

    const comments = await this.commentsService.findAllByPostId(id, userId);
    return { ...postToResponse(post), comments };
  }

  async update(
    id: number,
    userId: number,
    updateBookDiscussionDto: UpdateBookDiscussionDto,
  ) {
    let book = null;

    if (updateBookDiscussionDto.book) {
      book = await this.bookService.findAndCreateByIsbn(
        updateBookDiscussionDto.book,
      );
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...(updateBookDiscussionDto.title && {
          title: updateBookDiscussionDto.title,
        }),
        ...(updateBookDiscussionDto.content && {
          content: updateBookDiscussionDto.content,
        }),
        ...(book && {
          BookDiscussion: {
            update: {
              bookId: book.id,
            },
          },
        }),
      },
      include: prismaPostInclude(userId),
    });

    const comments = await this.commentsService.findAllByPostId(id, userId);

    return { ...postToResponse(post), comments };
  }

  async remove(id: number) {
    return this.postService.remove(id);
  }
}
