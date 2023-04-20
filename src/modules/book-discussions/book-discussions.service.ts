import { BadRequestException, Injectable } from '@nestjs/common';
import { Post, BookDiscussion, Book, Comment, PostLike } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { PostsService } from 'src/modules/posts/posts.service';
import { BooksService } from '../books/books.service';
import { CommentsService } from '../comments/comments.service';

import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';

@Injectable()
export class BookDiscussionsService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
    private bookService: BooksService,
    private commentsService: CommentsService,
  ) {}

  convertPostToReposnse(
    post: Post & {
      BookDiscussion: BookDiscussion & {
        Book: Book;
      };
      Comment?: Comment[];
      User: {
        username: string;
      };
      PostLike: PostLike[];
    },
  ) {
    return {
      id: post.id,
      author: post.User.username,
      title: post.title,
      content: post.content,
      views: post.views,
      thumbup: post.thumbup,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      book: post.BookDiscussion.Book,
      ...(post.Comment && { comments: post.Comment }),
      postLikedByUser: post.PostLike.length > 0 ? true : false,
    };
  }

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
      include: {
        BookDiscussion: {
          include: {
            Book: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
        PostLike: {
          where: {
            userId: authorId,
          },
        },
      },
    });

    return { ...this.convertPostToReposnse(post), comments: [] };
  }

  async findAll(limit: number, offset: number, userId: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        NOT: {
          BookDiscussion: null,
        },
      },
      take: limit,
      skip: offset,
      include: {
        BookDiscussion: {
          include: {
            Book: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
        PostLike: {
          where: {
            userId,
          },
        },
      },
    });
    const totalCount = await this.prisma.bookDiscussion.count();

    return { posts: posts.map(this.convertPostToReposnse), totalCount };
  }

  async findOne(id: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        BookDiscussion: {
          include: {
            Book: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
        PostLike: {
          where: {
            userId,
          },
        },
      },
    });

    if (!post.BookDiscussion) {
      throw new BadRequestException('독서 토론 형태의 게시물이 아닙니다');
    }

    const comments = await this.commentsService.findAllByPostId(id, userId);

    return { ...this.convertPostToReposnse(post), comments };
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
      include: {
        BookDiscussion: {
          include: {
            Book: true,
          },
        },
        User: {
          select: {
            username: true,
          },
        },
        PostLike: {
          where: {
            userId,
          },
        },
      },
    });

    const comments = await this.commentsService.findAllByPostId(id, userId);

    return { ...this.convertPostToReposnse(post), comments };
  }

  async remove(id: number) {
    return this.postService.remove(id);
  }
}
