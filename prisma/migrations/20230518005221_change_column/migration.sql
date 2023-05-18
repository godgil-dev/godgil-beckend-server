/*
  Warnings:

  - Made the column `pubDate` on table `Book` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Book` MODIFY `description` VARCHAR(191) NULL,
    MODIFY `pubDate` VARCHAR(191) NOT NULL;
