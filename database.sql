-- ========================================================
-- Velvet Brews Cafe Management System Database Schema
-- Compatible with XAMPP phpMyAdmin / MySQL / MariaDB
-- ========================================================

CREATE DATABASE IF NOT EXISTS `cafe_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cafe_db`;

-- --------------------------------------------------------
-- 1. Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `tables`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Users (Password for all demo accounts: password123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Velvet Owner', 'admin@cafe.com', '$2b$10$wKxO5JcE9n4A5mE5xZ5u8eQvW4X6yZ8u0V2W4X6yZ8u0V2W4X6yZ8', 'admin'),
(2, 'Staff Member', 'staff@cafe.com', '$2b$10$wKxO5JcE9n4A5mE5xZ5u8eQvW4X6yZ8u0V2W4X6yZ8u0V2W4X6yZ8', 'staff'),
(3, 'Rahul Sharma', 'customer@cafe.com', '$2b$10$wKxO5JcE9n4A5mE5xZ5u8eQvW4X6yZ8u0V2W4X6yZ8u0V2W4X6yZ8', 'customer');

-- --------------------------------------------------------
-- 2. Table structure for `menu_items` (50 Dishes, 50 Unique Photos)
-- --------------------------------------------------------
CREATE TABLE `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(500),
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `category`, `image_url`, `is_available`) VALUES
(1, 'Espresso', 'Rich and bold shot of pure coffee, brewed to perfection.', 120.00, 'Coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80', 1),
(2, 'Cappuccino', 'Equal parts espresso, steamed milk, and milk foam.', 160.00, 'Coffee', 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80', 1),
(3, 'Vanilla Latte', 'Smooth espresso mixed with steamed milk and vanilla.', 180.00, 'Coffee', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=80', 1),
(4, 'Caramel Macchiato', 'Steamed milk with vanilla marked with espresso & caramel.', 210.00, 'Coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80', 1),
(5, 'Cafe Mocha', 'Espresso blended with rich chocolate and steamed milk.', 190.00, 'Coffee', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=500&q=80', 1),
(6, 'Cold Brew Classic', 'Slow-steeped in cool water for 20 hours.', 150.00, 'Coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80', 1),
(7, 'Iced Hazelnut Mocha', 'Espresso, chocolate, hazelnut syrup over ice.', 230.00, 'Coffee', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80', 1),
(8, 'Irish Cream Latte', 'Velvety espresso with smooth Irish cream flavor.', 220.00, 'Coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80', 1),
(9, 'Flat White', 'Double espresso with microfoam steamed milk.', 170.00, 'Coffee', 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&q=80', 1),
(10, 'Affogato Al Caffe', 'Shot of hot espresso poured over vanilla gelato.', 220.00, 'Coffee', 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=500&q=80', 1),

(11, 'Masala Chai', 'Traditional Indian tea brewed with fragrant spices.', 80.00, 'Tea', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80', 1),
(12, 'Ginger Elaichi Chai', 'Fresh crushed ginger and cardamom brewed tea.', 90.00, 'Tea', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80', 1),
(13, 'Matcha Green Tea Latte', 'Premium grade matcha green tea with steamed milk.', 190.00, 'Tea', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80', 1),
(14, 'Earl Grey Tea', 'Black tea blend infused with citrusy bergamot oil.', 130.00, 'Tea', 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=500&q=80', 1),
(15, 'Iced Peach Tea', 'Brewed black tea infused with peach and ice.', 140.00, 'Tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80', 1),
(16, 'Lemon Honey Ginger Tea', 'Zesty lemon, natural ginger, and raw honey infusion.', 110.00, 'Tea', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80', 1),
(17, 'Chamomile Herbal Tea', 'Calming chamomile flowers steeped in hot water.', 120.00, 'Tea', 'https://images.unsplash.com/photo-1571934811356-5cc561b6821f?auto=format&fit=crop&w=500&q=80', 1),
(18, 'Rose Hibiscus Green Tea', 'Organic green tea layered with rose petals & hibiscus.', 130.00, 'Tea', 'https://images.unsplash.com/photo-1523920290228-4f34f514f44c?auto=format&fit=crop&w=500&q=80', 1),

(19, 'Margherita Pizza', 'Fresh tomato sauce, mozzarella, and fresh basil.', 290.00, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80', 1),
(20, 'Paneer Tikka Pizza', 'Spiced marinated paneer, capsicum, and mozzarella.', 340.00, 'Pizza', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80', 1),
(21, 'Farmhouse Veggie Pizza', 'Bell peppers, corn, mushrooms, olives & extra cheese.', 360.00, 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', 1),
(22, 'Peri Peri Cottage Cheese Pizza', 'Fiery peri peri paneer, jalapenos, and paprika.', 380.00, 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80', 1),
(23, 'Four Cheese Gourmet Pizza', 'Mozzarella, Processed, Cheddar & Cream Cheese.', 420.00, 'Pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=500&q=80', 1),
(24, 'Mexican Corn & Jalapeno Pizza', 'Sweet corn, pickled jalapenos, salsa drizzle & cheese.', 350.00, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80', 1),
(25, 'Tandoori Mushroom Pizza', 'Smoky tandoori marinated mushrooms with onions.', 360.00, 'Pizza', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=500&q=80', 1),
(26, 'Cheesy Garlic Crust Pizza', 'Stuffed garlic butter crust topped with herbs & cheese.', 330.00, 'Pizza', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80', 1),

(27, 'Bombay Grilled Sandwich', 'Spiced potato mash, mint chutney, and cheese toasted.', 180.00, 'Sandwich', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80', 1),
(28, 'Paneer Cheese Club Sandwich', 'Triple-decker toasted sandwich with cottage cheese.', 220.00, 'Sandwich', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=500&q=80', 1),
(29, 'Classic Veg Mayo Sandwich', 'Fresh vegetables folded in garlic mayo.', 150.00, 'Sandwich', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', 1),
(30, 'Cheese Garlic Toastie', 'Artisan sourdough with garlic butter & chilies.', 160.00, 'Sandwich', 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=500&q=80', 1),
(31, 'Corn & Cheese Grilled Sandwich', 'Sweet corn kernels smothered in molten cheese sauce.', 170.00, 'Sandwich', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=500&q=80', 1),
(32, 'Spinach & Mushroom Toastie', 'Sauteed garlic spinach and button mushrooms.', 190.00, 'Sandwich', 'https://images.unsplash.com/photo-1554433607-66b5e9d38c7e?auto=format&fit=crop&w=500&q=80', 1),
(33, 'Avocado Mayo Sandwich', 'Smashed avocado and cucumber in multigrain bread.', 230.00, 'Sandwich', 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=500&q=80', 1),
(34, 'Nutella Banana Toastie', 'Warm toasted brioche filled with Nutella & fresh banana.', 180.00, 'Sandwich', 'https://images.unsplash.com/photo-1559466273-d95e72debaf8?auto=format&fit=crop&w=500&q=80', 1),

(35, 'Butter Croissant', 'Flaky, buttery, freshly baked daily.', 130.00, 'Pastries', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80', 1),
(36, 'Chocolate Almond Croissant', 'Flaky croissant filled with chocolate and almonds.', 170.00, 'Pastries', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=500&q=80', 1),
(37, 'Belgian Chocolate Waffle', 'Golden waffle drizzled with warm Belgian chocolate.', 210.00, 'Pastries', 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=500&q=80', 1),
(38, 'New York Cheesecake Slice', 'Rich classic baked cheesecake with blueberry compote.', 260.00, 'Pastries', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80', 1),
(39, 'Double Chocolate Muffin', 'Moist chocolate muffin with dark chocolate chips.', 140.00, 'Pastries', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=500&q=80', 1),
(40, 'Tiramisu Pastry Slice', 'Italian coffee-soaked ladyfingers with mascarpone.', 250.00, 'Pastries', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80', 1),
(41, 'Warm Chocolate Fudge Brownie', 'Dense chocolate brownie served warm.', 180.00, 'Pastries', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', 1),
(42, 'French Vanilla Macaron (Set of 3)', 'Delicate almond meringue cookies with vanilla ganache.', 240.00, 'Pastries', 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=500&q=80', 1),

(43, 'Avocado Sourdough Toast', 'Smashed avocado on sourdough with chili flakes.', 270.00, 'Food', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=500&q=80', 1),
(44, 'Loaded Cheese Nachos', 'Tortilla chips with cheese sauce, salsa, and jalapenos.', 230.00, 'Food', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80', 1),
(45, 'Classic French Fries', 'Crispy salted golden potato fries served with dip.', 130.00, 'Food', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', 1),
(46, 'Cheesy Garlic Breadsticks', 'Freshly baked breadsticks loaded with garlic butter.', 180.00, 'Food', 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=500&q=80', 1),
(47, 'Arrabbiata Red Sauce Pasta', 'Penne pasta tossed in spicy tomato, garlic & herb sauce.', 280.00, 'Food', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?auto=format&fit=crop&w=500&q=80', 1),
(48, 'Crispy Veggie Burger', 'Crispy herb potato patty with lettuce, tomatoes & mayo.', 190.00, 'Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 1),
(49, 'Hummus & Warm Pita Bread', 'Creamy chickpea hummus with extra virgin olive oil & pita.', 260.00, 'Food', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', 1),
(50, 'Stuffed Mushroom Caps', 'Button mushrooms stuffed with herbs, garlic & baked cheese.', 270.00, 'Food', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80', 1);

-- --------------------------------------------------------
-- 3. Table structure for `tables`
-- --------------------------------------------------------
CREATE TABLE `tables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` INT NOT NULL UNIQUE,
  `capacity` INT NOT NULL,
  `status` ENUM('free', 'occupied', 'reserved') DEFAULT 'free',
  `current_bill` DECIMAL(10, 2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Tables
INSERT INTO `tables` (`id`, `table_number`, `capacity`, `status`, `current_bill`) VALUES
(1, 1, 2, 'occupied', 320.00),
(2, 2, 2, 'free', 0.00),
(3, 3, 4, 'free', 0.00),
(4, 4, 4, 'occupied', 480.00),
(5, 5, 6, 'occupied', 1250.00),
(6, 6, 4, 'free', 0.00);

-- --------------------------------------------------------
-- 4. Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` INT DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Orders
INSERT INTO `orders` (`id`, `table_number`, `user_id`, `total_amount`, `status`) VALUES
(1001, 4, 3, 370.00, 'preparing'),
(1002, 2, 3, 190.00, 'ready'),
(1003, 1, 3, 540.00, 'served');

-- --------------------------------------------------------
-- 5. Table structure for `order_items`
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `menu_item_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `order_items` (`order_id`, `menu_item_id`, `quantity`, `price`) VALUES
(1001, 1, 2, 120.00),
(1001, 35, 1, 130.00),
(1002, 13, 1, 190.00),
(1003, 19, 1, 290.00),
(1003, 28, 1, 220.00);

-- ========================================================
-- END OF DATABASE SCRIPT
-- ========================================================
