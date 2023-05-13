/*
  Warnings:

  - You are about to drop the column `isbn` on the `NewBooks` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `RecommendedBooks` table. All the data in the column will be lost.
  - Added the required column `bookId` to the `NewBooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NewBooks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookId` to the `RecommendedBooks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `NewBooks_isbn_key` ON `NewBooks`;

-- DropIndex
DROP INDEX `RecommendedBooks_isbn_key` ON `RecommendedBooks`;

-- AlterTable
ALTER TABLE `NewBooks` DROP COLUMN `isbn`,
    ADD COLUMN `bookId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `RecommendedBooks` DROP COLUMN `isbn`,
    ADD COLUMN `bookId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `NewBooks` ADD CONSTRAINT `NewBooks_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecommendedBooks` ADD CONSTRAINT `RecommendedBooks_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
