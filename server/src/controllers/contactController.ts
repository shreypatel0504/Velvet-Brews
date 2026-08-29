import { Request, Response } from 'express';
import { io } from '../app';

const inMemoryContacts: any[] = [
  {
    _id: 'MSG101',
    name: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    phone: '+91 98250 11223',
    subject: 'Private Party & Catering Booking',
    message: 'Hello Velvet Brews team, we want to book the outdoor patio for a birthday celebration of 25 guests next weekend. Please share packages.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'MSG102',
    name: 'Kavita Roy',
    email: 'kavita@example.com',
    phone: '+91 97123 44556',
    subject: 'Feedback on Coffee Quality',
    message: 'Loved the Hazelnut Cold Brew! Is there an option to purchase your roasted coffee beans for home espresso machines?',
    status: 'replied',
    reply: 'Thank you Kavita! Yes, we offer 250g whole beans at our counter.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const inMemorySubscribers: any[] = [
  { _id: 'SUB1', email: 'rahul.s@example.com', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: 'SUB2', email: 'priya.patel@example.com', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { _id: 'SUB3', email: 'vikram.j@example.com', createdAt: new Date().toISOString() }
];

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactPayload = {
      _id: 'MSG' + Math.floor(100 + Math.random() * 900),
      name: name || 'Guest Visitor',
      email: email || 'visitor@example.com',
      phone: phone || '+91 99000 00000',
      subject: subject || 'General Inquiry',
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    inMemoryContacts.unshift(contactPayload);

    // Socket notification to admin panel
    io.emit('new-contact', contactPayload);

    res.status(201).json(contactPayload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getContactMessages = async (req: Request, res: Response) => {
  res.json(inMemoryContacts);
};

export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    const item = inMemoryContacts.find(c => c._id === id || c.id === id);
    if (item) {
      if (status) item.status = status;
      if (reply) item.reply = reply;
    }

    const payload = item || { _id: id, status, reply };
    io.emit('contact-updated', payload);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subPayload = {
      _id: 'SUB' + Math.floor(1000 + Math.random() * 9000),
      email,
      createdAt: new Date().toISOString()
    };

    if (!inMemorySubscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      inMemorySubscribers.unshift(subPayload);
    }

    io.emit('new-subscriber', subPayload);
    res.status(201).json(subPayload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscribers = async (req: Request, res: Response) => {
  res.json(inMemorySubscribers);
};
