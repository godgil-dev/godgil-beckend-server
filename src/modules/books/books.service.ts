import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { postToResponseWithoutBook } from './utils/response.utils';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  findAll() {
    return `This action returns all books`;
  }

  async findOne(id: number) {
    return await this.prisma.book.findUnique({
      where: { id },
    });
  }

  async findOneByIsbn(isbn: string) {
    return await this.prisma.book.findUnique({
      where: { isbn },
    });
  }

  async findBookDiscussionsByIsbn(
    isbn: string,
    offset: number,
    limit: number,
    userId: number,
  ) {
    const book = await this.findOneByIsbn(isbn);

    if (!book) {
      throw new NotFoundException(`[${isbn}] book not found`);
    }

    const bookDiscussions = await this.prisma.bookDiscussion.findMany({
      where: { bookId: book.id },
      include: {
        Post: {
          include: {
            PostLike: true,
            BookDiscussion: {
              include: {
                Book: true,
              },
            },
          },
        },
      },
      skip: offset,
      orderBy: { Post: { createdAt: 'desc' } },
      take: limit,
    });

    const posts = bookDiscussions.map((bookDiscussion) => {
      const post = bookDiscussion.Post;
      const isLiked = post.PostLike.some((like) => like.userId === userId);
      return postToResponseWithoutBook(post, isLiked);
    });

    return { posts, book };
  }

  async findAndCreateByIsbn(createBookDto: CreateBookDto) {
    let book = await this.findOneByIsbn(createBookDto.isbn);

    if (!book) {
      book = await this.create(createBookDto);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    return await this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async updateByIsbn(isbn: string, updateBookDto: UpdateBookDto) {
    return await this.prisma.book.update({
      where: { isbn },
      data: updateBookDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
