import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import Staff from '../models/Staff';
import User from '../models/User';
import { io } from '../app';

const dataDir = path.join(process.cwd(), 'data');
const staffFilePath = path.join(dataDir, 'staff.json');

const initialStaff: any[] = [
  {
    _id: 'STF1001',
    id: 'STF1001',
    name: 'Rajesh Kumar',
    role: 'barista',
    phone: '+91 98765 43210',
    email: 'rajesh@velvetbrews.com',
    shift: 'Morning (8 AM - 4 PM)',
    status: 'Active',
    hourlyRate: 350,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 98765 00000',
    joinedDate: '2023-04-15',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'STF1002',
    id: 'STF1002',
    name: 'Amit Verma',
    role: 'manager',
    phone: '+91 99887 11223',
    email: 'amit@velvetbrews.com',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'Active',
    hourlyRate: 380,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 99887 00000',
    joinedDate: '2023-08-01',
    createdAt: new Date().toISOString()
  }
];

let inMemoryStaff: any[] = [];

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (fs.existsSync(staffFilePath)) {
    const raw = fs.readFileSync(staffFilePath, 'utf-8');
    inMemoryStaff = JSON.parse(raw);
  } else {
    inMemoryStaff = [...initialStaff];
    fs.writeFileSync(staffFilePath, JSON.stringify(inMemoryStaff, null, 2));
  }
} catch (e) {
  inMemoryStaff = [...initialStaff];
}

const saveStaffToFile = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(staffFilePath, JSON.stringify(inMemoryStaff, null, 2));
  } catch (err) {
    console.warn('Failed to write staff to file:', err);
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const staffList = await Staff.find({}).sort({ createdAt: -1 });
      if (staffList && staffList.length > 0) {
        return res.json(staffList);
      }
    }
    res.json(inMemoryStaff);
  } catch {
    res.json(inMemoryStaff);
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, role, phone, email, shift, status, hourlyRate, avatar, emergencyContact } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const staffName = String(name || 'Staff Member').trim();
    const staffRole = String(role || 'barista').toLowerCase();

    const staffData = {
      name: staffName,
      role: staffRole,
      phone: phone || '+91 98765 00000',
      email: normalizedEmail,
      shift: shift || 'Morning (8 AM - 4 PM)',
      status: status || 'Active',
      hourlyRate: Number(hourlyRate) || 250,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffName)}`,
      emergencyContact: emergencyContact || '',
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let created: any = null;

    // 1. Save to MongoDB Staff collection
    if (mongoose.connection.readyState === 1) {
      try {
        const newStaff = new Staff(staffData);
        created = await newStaff.save();
        created = created.toObject();
        console.log(`✅ [MongoDB Staff Created] ${staffName} (${normalizedEmail}) in Staff collection`);
      } catch (dbErr: any) {
        console.warn('MongoDB Staff.create failed, using fallback:', dbErr.message);
      }
    }

    // 2. Also register in Users collection so they appear as registered user
    if (mongoose.connection.readyState === 1 && normalizedEmail) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash('password123', 10);
          const userRole: 'admin' | 'staff' | 'customer' = staffRole === 'admin' ? 'admin' : 'staff';
          await User.create({
            name: staffName,
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole
          });
          console.log(`✅ [MongoDB User Created for Staff] ${normalizedEmail} with role: ${userRole}`);
        }
      } catch (userDbErr: any) {
        console.warn('MongoDB User creation for staff failed:', userDbErr.message);
      }
    }

    const payload = {
      _id: created?._id ? created._id.toString() : ('STF' + Math.floor(1000 + Math.random() * 9000)),
      id: created?._id ? created._id.toString() : ('STF' + Math.floor(1000 + Math.random() * 9000)),
      ...staffData
    };

    inMemoryStaff.unshift(payload);
    saveStaffToFile();

    io.emit('staff-added', payload);
    res.status(201).json(payload);
  } catch (error: any) {
    console.error('❌ [STAFF CREATE ERROR]:', error);
    res.status(500).json({ message: error.message || 'Error creating staff' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const memItem = inMemoryStaff.find(s => s._id === id || s.id === id);
    if (memItem) {
      Object.assign(memItem, updateData);
      saveStaffToFile();
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const staffMember = await Staff.findById(id);
        if (staffMember) {
          Object.assign(staffMember, updateData);
          const updated = await staffMember.save();
          io.emit('staff-updated', updated);
          return res.json(updated);
        }
      } catch (e) {
        // Fallback
      }
    }

    const payload = memItem || { _id: id, id, ...updateData };
    io.emit('staff-updated', payload);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const index = inMemoryStaff.findIndex(s => s._id === id || s.id === id);
    let deletedEmail = '';
    if (index !== -1) {
      deletedEmail = inMemoryStaff[index].email;
      inMemoryStaff.splice(index, 1);
      saveStaffToFile();
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await Staff.deleteOne({ _id: id });
        if (deletedEmail) {
          await User.deleteOne({ email: deletedEmail });
        }
        console.log(`✅ [MongoDB Staff Deleted] ID: ${id}`);
      } catch (e) {
        // Fallback
      }
    }

    io.emit('staff-deleted', { _id: id, id });
    res.json({ message: 'Staff deleted successfully', _id: id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

