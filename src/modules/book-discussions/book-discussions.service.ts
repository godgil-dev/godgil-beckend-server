import { Injectable } from '@nestjs/common';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post, BookDiscussion, Book } from '@prisma/client';
import { PostsService } from 'src/modules/posts/posts.service';
import { BooksService } from '../books/books.service';

@Injectable()
export class BookDiscussionsService {
  constructor(
    private prisma: PrismaService,
    private postService: PostsService,
    private bookService: BooksService,
  ) {}

  convertPostToReposnse(
    post: Post & {
      BookDiscussion: BookDiscussion & {
        Book: Book;
      };

      User: {
        username: string;
      };
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
      },
    });
    console.log(post);

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
      },
    });

    return this.convertPostToReposnse(post);
  }

  async update(id: number, updateBookDiscussionDto: UpdateBookDiscussionDto) {
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
      },
    });

    return this.convertPostToReposnse(post);
  }

  async remove(id: number) {
    return this.postService.remove(id);
  }
}
