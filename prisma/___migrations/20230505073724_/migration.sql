/*
  Warnings:

  - You are about to drop the column `image` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `translator` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `thumbup` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "image",
DROP COLUMN "translator",
DROP COLUMN "url",
ADD COLUMN     "cover" TEXT DEFAULT '',
ADD COLUMN     "link" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "thumbup";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roleId" SET DEFAULT 2;

-- CreateTable
CREATE TABLE "NewBooks" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendedBooks" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendedBooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewBooks_bookId_key" ON "NewBooks"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendedBooks_bookId_key" ON "RecommendedBooks"("bookId");

-- AddForeignKey
ALTER TABLE "NewBooks" ADD CONSTRAINT "NewBooks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedBooks" ADD CONSTRAINT "RecommendedBooks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
