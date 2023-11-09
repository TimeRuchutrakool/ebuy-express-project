/*
  Warnings:

  - You are about to drop the column `seller_id` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_seller_id_fkey`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `seller_id`;
