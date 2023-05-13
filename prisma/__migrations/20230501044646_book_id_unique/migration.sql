/*
  Warnings:

  - A unique constraint covering the columns `[bookId]` on the table `NewBooks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookId]` on the table `RecommendedBooks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `NewBooks_bookId_key` ON `NewBooks`(`bookId`);

-- CreateIndex
CREATE UNIQUE INDEX `RecommendedBooks_bookId_key` ON `RecommendedBooks`(`bookId`);
