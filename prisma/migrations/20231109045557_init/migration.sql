-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `point` INTEGER NOT NULL DEFAULT 0,
    `profile_image` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avgRating` DECIMAL(2, 1) NOT NULL DEFAULT 0,
    `stripe_api_id` VARCHAR(191) NULL,
    `seller_id` INTEGER NOT NULL,
    `type_id` INTEGER NOT NULL,
    `brand_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(191) NOT NULL,
    `product_id` INTEGER NULL,
    `bid_product_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `color_id` INTEGER NULL,
    `shoe_size_id` INTEGER NULL,
    `shirtSizeId` INTEGER NULL,
    `pantsSizeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shoe_sizes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shirt_sizes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pants_sizes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `color_id` INTEGER NOT NULL,
    `shoe_id` INTEGER NULL,
    `pant_size_id` INTEGER NULL,
    `shirt_size_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wish_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyer_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `buyer_id` INTEGER NOT NULL,
    `seller_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `track_number` VARCHAR(191) NULL,
    `logistics_name` VARCHAR(191) NULL,
    `transaction_number` INTEGER NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `order_id` INTEGER NOT NULL,
    `bid_product_id` INTEGER NULL,
    `product_id` INTEGER NULL,
    `transactionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bid_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `initialPrice` DECIMAL(10, 2) NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `duration` DECIMAL(65, 30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `bidPrice` DECIMAL(10, 2) NULL,
    `buyer_id` INTEGER NULL,
    `seller_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatrooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_1_id` INTEGER NOT NULL,
    `user_2_id` INTEGER NOT NULL,
    `latest_message_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `send_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `chatroom_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `postalcode` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `address_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seller_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `billPerTransaction` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `total_bill` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_bid_product_id_fkey` FOREIGN KEY (`bid_product_id`) REFERENCES `bid_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_shoe_size_id_fkey` FOREIGN KEY (`shoe_size_id`) REFERENCES `shoe_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_shirtSizeId_fkey` FOREIGN KEY (`shirtSizeId`) REFERENCES `shirt_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_pantsSizeId_fkey` FOREIGN KEY (`pantsSizeId`) REFERENCES `pants_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_shoe_id_fkey` FOREIGN KEY (`shoe_id`) REFERENCES `shoe_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_pant_size_id_fkey` FOREIGN KEY (`pant_size_id`) REFERENCES `pants_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_shirt_size_id_fkey` FOREIGN KEY (`shirt_size_id`) REFERENCES `shirt_sizes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wish_items` ADD CONSTRAINT `wish_items_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wish_items` ADD CONSTRAINT `wish_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_bid_product_id_fkey` FOREIGN KEY (`bid_product_id`) REFERENCES `bid_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bid_products` ADD CONSTRAINT `bid_products_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bid_products` ADD CONSTRAINT `bid_products_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatrooms` ADD CONSTRAINT `chatrooms_user_1_id_fkey` FOREIGN KEY (`user_1_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatrooms` ADD CONSTRAINT `chatrooms_user_2_id_fkey` FOREIGN KEY (`user_2_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatroom_id_fkey` FOREIGN KEY (`chatroom_id`) REFERENCES `chatrooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
