/*
  Warnings:

  - You are about to drop the column `payment_method` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_number` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order_items` DROP COLUMN `payment_method`,
    DROP COLUMN `transaction_number`;
