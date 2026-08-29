import { Request, Response } from 'express';
import Staff from '../models/Staff';
import { io } from '../app';

const inMemoryStaff: any[] = [
  {
    _id: 'STF1001',
    id: 'STF1001',
    name: 'Rajesh Kumar',
    role: 'Head Barista',
    phone: '+91 98765 43210',
    email: 'rajesh@velvetbrews.com',
    shift: 'Morning (8 AM - 4 PM)',
    status: 'Active',
    hourlyRate: 350,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 98765 00000',
    joinedDate: '2023-04-15'
  },
  {
    _id: 'STF1002',
    id: 'STF1002',
    name: 'Amit Verma',
    role: 'Pastry Chef',
    phone: '+91 99887 11223',
    email: 'amit@velvetbrews.com',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'Active',
    hourlyRate: 380,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 99887 00000',
    joinedDate: '2023-08-01'
  },
  {
    _id: 'STF1003',
    id: 'STF1003',
    name: 'Kavita Shah',
    role: 'Floor Supervisor',
    phone: '+91 97766 55443',
    email: 'kavita@velvetbrews.com',
    shift: 'Evening (2 PM - 10 PM)',
    status: 'Active',
    hourlyRate: 320,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 97766 00000',
    joinedDate: '2024-01-10'
  },
  {
    _id: 'STF1004',
    id: 'STF1004',
    name: 'Siddharth Rao',
    role: 'Senior Barista',
    phone: '+91 96543 21098',
    email: 'siddharth@velvetbrews.com',
    shift: 'Evening (2 PM - 10 PM)',
    status: 'On Leave',
    hourlyRate: 280,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    emergencyContact: '+91 96543 00000',
    joinedDate: '2024-03-20'
  }
];

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staffList = await Staff.find({}).sort({ createdAt: -1 });
    if (staffList && staffList.length > 0) {
      return res.json(staffList);
    }
    res.json(inMemoryStaff);
  } catch {
    res.json(inMemoryStaff);
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, role, phone, email, shift, status, hourlyRate, avatar, emergencyContact } = req.body;

    const staffData = {
      name: name || 'New Staff Member',
      role: role || 'Barista',
      phone: phone || '+91 98765 00000',
      email: email || 'staff@velvetbrews.com',
      shift: shift || 'Morning (8 AM - 4 PM)',
      status: status || 'Active',
      hourlyRate: Number(hourlyRate) || 250,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'staff')}`,
      emergencyContact: emergencyContact || '',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    let created: any = null;
    try {
      const newStaff = new Staff(staffData);
      created = await newStaff.save();
      created = created.toObject();
    } catch {
      created = {
        _id: 'STF' + Math.floor(1000 + Math.random() * 9000),
        id: 'STF' + Math.floor(1000 + Math.random() * 9000),
        ...staffData
      };
    }

    const payload = {
      _id: created._id || ('STF' + Math.floor(1000 + Math.random() * 9000)),
      id: created._id || ('STF' + Math.floor(1000 + Math.random() * 9000)),
      ...staffData
    };

    inMemoryStaff.unshift(payload);
    io.emit('staff-added', payload);
    res.status(201).json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const memItem = inMemoryStaff.find(s => s._id === id || s.id === id);
    if (memItem) {
      Object.assign(memItem, updateData);
    }

    try {
      const staffMember = await Staff.findById(id);
      if (staffMember) {
        Object.assign(staffMember, updateData);
        const updated = await staffMember.save();
        io.emit('staff-updated', updated);
        return res.json(updated);
      }
    } catch {
      // Fallback
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
    if (index !== -1) {
      inMemoryStaff.splice(index, 1);
    }

    try {
      await Staff.deleteOne({ _id: id });
    } catch {
      // Fallback
    }

    io.emit('staff-deleted', { _id: id, id });
    res.json({ message: 'Staff deleted', _id: id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
