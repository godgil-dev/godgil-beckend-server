import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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

  async findOneByIsbn(isbn: number) {
    return await this.prisma.book.findUnique({
      where: { isbn },
    });
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

  async updateByIsbn(isbn: number, updateBookDto: UpdateBookDto) {
    return await this.prisma.book.update({
      where: { isbn },
      data: updateBookDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
