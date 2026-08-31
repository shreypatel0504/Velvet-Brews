import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middlewares/auth';

// File persistence path for offline/fallback storage
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Could not create data dir:', err);
  }
}

// Default seed users with hashed passwords
const defaultHashedPassword = bcrypt.hashSync('password123', 10);
const initialUsers = [
  {
    _id: 'USR1001',
    id: 'USR1001',
    name: 'Admin User',
    email: 'admin@cafe.com',
    password: defaultHashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'USR1002',
    id: 'USR1002',
    name: 'Staff Member',
    email: 'staff@cafe.com',
    password: defaultHashedPassword,
    role: 'staff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'USR1003',
    id: 'USR1003',
    name: 'Demo Customer',
    email: 'customer@cafe.com',
    password: defaultHashedPassword,
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const loadUsersFromFile = (): any[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading users.json:', e);
  }
  return initialUsers;
};

const inMemoryUsers: any[] = loadUsersFromFile();

const saveUsersToFile = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(inMemoryUsers, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Error writing users.json:', e);
  }
};

// Auto sync in-memory users to MongoDB when DB is connected
export const syncUsersToMongoDB = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    for (const memUser of inMemoryUsers) {
      const exists = await User.findOne({ email: memUser.email });
      if (!exists) {
        await User.create({
          name: memUser.name,
          email: memUser.email,
          password: memUser.password,
          role: memUser.role || 'customer',
        });
      }
    }
  } catch (err) {
    console.warn('Could not sync users to MongoDB:', err);
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Check in-memory store
    const memExists = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (memExists) {
      res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let createdUser: any = null;

    // If MongoDB is connected, save directly to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const dbExists = await User.findOne({ email: normalizedEmail });
        if (dbExists) {
          res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
          return;
        }

        const mongoUser = await User.create({
          name: String(name).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: role || 'customer',
        });
        createdUser = mongoUser.toObject();
        console.log(`✅ [MongoDB Saved] User registered in MongoDB: ${mongoUser.email} (ID: ${mongoUser._id})`);
      } catch (dbErr: any) {
        console.warn('MongoDB User.create failed, falling back to persistent store:', dbErr.message);
      }
    }

    // If MongoDB not connected or failed, create with generated ID
    if (!createdUser) {
      const generatedId = 'USR' + Math.floor(10000 + Math.random() * 90000);
      createdUser = {
        _id: generatedId,
        id: generatedId,
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log(`💾 [Local Saved] User registered in persistent store: ${createdUser.email} (ID: ${createdUser._id})`);
    }

    // Always update in-memory / file cache
    if (!inMemoryUsers.some((u) => u.email === normalizedEmail)) {
      inMemoryUsers.push({
        _id: (createdUser._id || createdUser.id).toString(),
        id: (createdUser._id || createdUser.id).toString(),
        name: createdUser.name,
        email: createdUser.email,
        password: hashedPassword,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      saveUsersToFile();
    }

    const userId = (createdUser._id || createdUser.id).toString();
    res.status(201).json({
      _id: userId,
      id: userId,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      token: generateToken(userId, createdUser.role),
    });
  } catch (error: any) {
    console.error('❌ [AUTH ERROR] Registration failed:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const authUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide both email and password' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user: any = null;

    // Check MongoDB first if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findOne({ email: normalizedEmail }).select('+password');
        if (dbUser) {
          user = dbUser;
        }
      } catch (dbErr: any) {
        console.warn('MongoDB User.findOne query error, using local fallback:', dbErr.message);
      }
    }

    // If not found in DB or DB offline, check in-memory store
    if (!user) {
      const memUser = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (memUser) {
        user = memUser;
      }
    }

    if (!user) {
      res.status(404).json({
        notRegistered: true,
        message: 'No account found with this email in the database. Please Sign Up / Register first.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({
        notRegistered: false,
        message: 'Incorrect password. Please verify your password and try again.'
      });
      return;
    }

    const userId = (user._id || user.id).toString();
    console.log(`✅ [AUTH SUCCESS] User logged in: ${user.email} (${user.role}) [ID: ${userId}]`);

    res.json({
      _id: userId,
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(userId, user.role),
    });
  } catch (error: any) {
    console.error('❌ [AUTH ERROR] Login failed:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      _id: (req.user._id || (req.user as any).id).toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching user profile' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUsers = await User.find({}).select('-password');
        if (dbUsers && dbUsers.length > 0) {
          res.json(dbUsers);
          return;
        }
      } catch {}
    }

    // Return inMemoryUsers without password hash
    const safeUsers = inMemoryUsers.map((u) => ({
      _id: u._id || u.id,
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    res.json(safeUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error fetching users' });
  }
};


