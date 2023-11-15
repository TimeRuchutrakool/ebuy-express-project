/*
  Warnings:

  - You are about to drop the column `pant_size_id` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `shoe_id` on the `cart_items` table. All the data in the column will be lost.
  - Added the required column `type` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_pant_size_id_fkey`;

-- DropForeignKey
ALTER TABLE `cart_items` DROP FOREIGN KEY `cart_items_shoe_id_fkey`;

-- AlterTable
ALTER TABLE `bid_products` ADD COLUMN `stripe_api_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cart_items` DROP COLUMN `pant_size_id`,
    DROP COLUMN `shoe_id`,
    ADD COLUMN `pants_size_id` INTEGER NULL,
    ADD COLUMN `shoe_size_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `status` ENUM('PENDING', 'SUCCESS') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_shoe_size_id_fkey` FOREIGN KEY (`shoe_size_id`) REFERENCES `shoe_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_pants_size_id_fkey` FOREIGN KEY (`pants_size_id`) REFERENCES `pants_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
