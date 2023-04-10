import { Injectable } from '@nestjs/common';
import { CreateBookDiscussionDto } from './dto/create-book-discussion.dto';
import { UpdateBookDiscussionDto } from './dto/update-book-discussion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post, BookDiscussion, Book } from '@prisma/client';

@Injectable()
export class BookDiscussionsService {
  constructor(private prisma: PrismaService) {}

  convertPostToReposnse(
    post: Post & {
      BookDiscussion: (BookDiscussion & {
        Book: Book;
      })[];
    },
  ) {
    return {
      id: post.id,
      authorId: post.authorId,
      title: post.title,
      content: post.content,
      views: post.views,
      thumbup: post.thumbup,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      book: post.BookDiscussion[0].Book,
    };
  }

  async create(
    createBookDiscussionDto: CreateBookDiscussionDto,
    authorId: number,
  ) {
    let book = await this.prisma.book.findUnique({
      where: { ibsn: createBookDiscussionDto.book.ibsn },
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
        },
      }),
      this.prisma.bookDiscussion.count(),
    ]);

    return { posts: posts.map(this.convertPostToReposnse), totalCount };
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateBookDiscussionDto: UpdateBookDiscussionDto) {
    return `This action updates a #${id} bookDiscussion`;
  }

  async remove(id: number) {
    return `This action removes a #${id} bookDiscussion`;
  }
}
