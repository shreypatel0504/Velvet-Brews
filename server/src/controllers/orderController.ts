import { Request, Response } from 'express';
import Order from '../models/Order';
import { io } from '../app';

const inMemoryOrders: any[] = [];

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, table, customer, status } = req.body;
    
    const formattedItems = items?.map((i: any) => ({
      menuItem: i.menuItem || i.id || undefined,
      name: i.name || 'Menu Item',
      quantity: i.quantity || i.qty || 1,
      price: i.price || 0,
      imageUrl: i.imageUrl || i.img || ''
    })) || [];

    const orderStatus = status || 'preparing';

    const payload = {
      items: formattedItems,
      totalAmount: totalAmount || 0,
      table: table || 'Table 1',
      customer: customer || 'Guest Customer',
      status: orderStatus,
      createdAt: new Date()
    };

    let createdOrder: any = null;
    try {
      // Try Mongoose save if valid Mongo ID
      const order = new Order({
        items: formattedItems.filter((fi: any) => fi.menuItem && String(fi.menuItem).length === 24),
        totalAmount: payload.totalAmount,
        status: orderStatus
      });
      createdOrder = await order.save();
      createdOrder = createdOrder.toObject();
    } catch {
      // Fallback order object
      createdOrder = {
        _id: 'ORD' + Math.floor(1000 + Math.random() * 9000),
        ...payload
      };
    }

    // Attach raw items & table info for Socket broadcast
    const broadcastOrder = {
      _id: createdOrder._id || ('ORD' + Math.floor(1000 + Math.random() * 9000)),
      id: createdOrder._id || ('ORD' + Math.floor(1000 + Math.random() * 9000)),
      table: typeof table === 'string' ? table : 'Table 1',
      customer: customer || 'Guest Customer',
      items: formattedItems,
      totalAmount: payload.totalAmount,
      status: orderStatus,
      createdAt: new Date()
    };

    // Store in memory list
    inMemoryOrders.unshift(broadcastOrder);

    // Broadcast live new-order event
    io.emit('new-order', broadcastOrder);

    // AUTOMATED PROGRESSION:
    // 1. After 8 seconds -> Auto transition from 'preparing' to 'ready'
    setTimeout(() => {
      const orderItem = inMemoryOrders.find(o => o._id === broadcastOrder._id || o.id === broadcastOrder._id);
      if (orderItem && orderItem.status === 'preparing') {
        orderItem.status = 'ready';
        const updatePayload = { _id: orderItem._id, id: orderItem.id, status: 'ready' };
        io.emit('order-updated', updatePayload);

        // 2. After another 8 seconds -> Auto transition from 'ready' to 'served'
        setTimeout(() => {
          if (orderItem && orderItem.status === 'ready') {
            orderItem.status = 'served';
            const finalPayload = { _id: orderItem._id, id: orderItem.id, status: 'served' };
            io.emit('order-updated', finalPayload);
          }
        }, 8000);
      }
    }, 8000);

    res.status(201).json(broadcastOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    if (orders && orders.length > 0) {
      return res.json(orders);
    }
    res.json(inMemoryOrders);
  } catch (error: any) {
    res.json(inMemoryOrders);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      return res.json(order);
    }
    const memOrder = inMemoryOrders.find(o => o._id === req.params.id || o.id === req.params.id);
    if (memOrder) {
      return res.json(memOrder);
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (error: any) {
    const memOrder = inMemoryOrders.find(o => o._id === req.params.id || o.id === req.params.id);
    if (memOrder) {
      return res.json(memOrder);
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const memItem = inMemoryOrders.find(o => o._id === id || o.id === id);
    if (memItem) {
      memItem.status = status;
    }

    try {
      const order = await Order.findById(id);
      if (order) {
        order.status = status;
        const updatedOrder = await order.save();
        io.emit('order-updated', updatedOrder);
        return res.json(updatedOrder);
      }
    } catch {
      // Ignore DB error
    }

    const payload = memItem || { _id: id, id, status };
    io.emit('order-updated', payload);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

