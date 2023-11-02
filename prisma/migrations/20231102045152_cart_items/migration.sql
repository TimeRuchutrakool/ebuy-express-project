-- AlterTable
ALTER TABLE `cart_items` ADD COLUMN `color_id` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `pant_size_id` INTEGER NULL,
    ADD COLUMN `shirt_size_id` INTEGER NULL,
    ADD COLUMN `shoe_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_shoe_id_fkey` FOREIGN KEY (`shoe_id`) REFERENCES `shoe_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_pant_size_id_fkey` FOREIGN KEY (`pant_size_id`) REFERENCES `pants_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_shirt_size_id_fkey` FOREIGN KEY (`shirt_size_id`) REFERENCES `shirt_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
