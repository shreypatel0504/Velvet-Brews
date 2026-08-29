"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../src/models/User"));
const MenuItem_1 = __importDefault(require("../src/models/MenuItem"));
const Table_1 = __importDefault(require("../src/models/Table"));
const Order_1 = __importDefault(require("../src/models/Order"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-db');
        console.log('MongoDB connected for seeding');
    }
    catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};
const users = [
    {
        name: 'Admin User',
        email: 'admin@cafe.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: 'Staff Member',
        email: 'staff@cafe.com',
        password: 'password123',
        role: 'staff',
    },
    {
        name: 'Demo Customer',
        email: 'customer@cafe.com',
        password: 'password123',
        role: 'customer',
    },
];
const menuItems = [
    {
        name: 'Espresso',
        description: 'A rich and bold shot of pure coffee, brewed to perfection.',
        price: 3.5,
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Cappuccino',
        description: 'Equal parts espresso, steamed milk, and milk foam. Classic and creamy.',
        price: 4.5,
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Vanilla Latte',
        description: 'Smooth espresso mixed with steamed milk and a touch of vanilla syrup.',
        price: 5.0,
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Matcha Green Tea Latte',
        description: 'Premium grade matcha green tea blended with steamed milk.',
        price: 5.5,
        category: 'Tea',
        imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Avocado Toast',
        description: 'Smashed avocado on artisan sourdough topped with chili flakes and microgreens.',
        price: 8.5,
        category: 'Food',
        imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Butter Croissant',
        description: 'Flaky, buttery, and freshly baked in-house daily.',
        price: 3.5,
        category: 'Pastries',
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    },
    {
        name: 'Chocolate Chip Cookie',
        description: 'Warm, gooey chocolate chip cookie with sea salt sprinkled on top.',
        price: 3.0,
        category: 'Pastries',
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
        isAvailable: true,
    }
];
const tables = [
    { tableNumber: 1, capacity: 2, status: 'free' },
    { tableNumber: 2, capacity: 2, status: 'free' },
    { tableNumber: 3, capacity: 4, status: 'free' },
    { tableNumber: 4, capacity: 4, status: 'free' },
    { tableNumber: 5, capacity: 6, status: 'free' },
];
const importData = async () => {
    try {
        await connectDB();
        await Order_1.default.deleteMany();
        await Table_1.default.deleteMany();
        await MenuItem_1.default.deleteMany();
        await User_1.default.deleteMany();
        // Hash passwords
        for (const user of users) {
            const salt = await bcrypt_1.default.genSalt(10);
            user.password = await bcrypt_1.default.hash(user.password, salt);
        }
        await User_1.default.insertMany(users);
        await MenuItem_1.default.insertMany(menuItems);
        await Table_1.default.insertMany(tables);
        console.log('Data Imported successfully!');
        process.exit();
    }
    catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};
importData();
