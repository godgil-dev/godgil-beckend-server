import { Injectable } from '@nestjs/common';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Post,
  BookDiscussion,
  Book,
  User,
  Comment,
  CommentLike,
} from '@prisma/client';

@Injectable()
export class BookDiscussionsService {
  constructor(private prisma: PrismaService) {}

  convertPostToReposnse(
    post: Post & {
      BookDiscussion: (BookDiscussion & {
        Book: Book;
      })[];
      Comment?: (Comment & {
        User: {
          username: string;
        };
        _count: {
          CommentLike: number;
          CommentDislike: number;
        };
      })[];
      User: {
        username: string;
      };
    },
  ) {
    let comments = null;

    if (post?.Comment) {
      comments = post?.Comment.map((comment) => {
        const { authorId, postId, isAgree, User, _count, ...rest } = comment;

        return {
          ...rest,
          author: User.username,
          like: _count.CommentLike,
          dislike: _count.CommentDislike,
        };
      });
    }

    return {
      id: post.id,
      author: post.User.username,
      title: post.title,
      content: post.content,
      views: post.views,
      thumbup: post.thumbup,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      book: post.BookDiscussion[0].Book,
      ...(comments && { comments }),
    };
  }

  async create(
    createBookDiscussionDto: CreateBookDiscussionDto,
    authorId: number,
  ) {
    let book = await this.prisma.book.findUnique({
      where: { isbn: createBookDiscussionDto.book.isbn },
    });

    if (!book) {
      book = await this.prisma.book.create({
        data: createBookDiscussionDto.book,
      });
    }

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
      },
    });

    return this.convertPostToReposnse(post);
  }

  async findAll(limit: number, offset: number) {
    const [posts, totalCount] = await this.prisma.$transaction([
      this.prisma.post.findMany({
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
        },
      }),
      this.prisma.bookDiscussion.count(),
    ]);

    return { posts: posts.map(this.convertPostToReposnse), totalCount };
  }

  async findOne(id: number) {
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
        Comment: {
          include: {
            User: {
              select: {
                username: true,
              },
            },
            _count: {
              select: {
                CommentLike: true,
                CommentDislike: true,
              },
            },
          },
        },
      },
    });

    return this.convertPostToReposnse(post);
  }

  async update(id: number, updateBookDiscussionDto: UpdateBookDiscussionDto) {
    return `This action updates a #${id} bookDiscussion`;
  }

  async remove(id: number) {
    return `This action removes a #${id} bookDiscussion`;
  }
}
