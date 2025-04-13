import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import connectDB from './config/db';
import Item from './models/Item';
import Folder from './models/Folder';

// Define types for reordering items
interface ReorderItemData {
  id: string;
  order: number;
  folderId: string | null;
}

interface ReorderFolderData {
  id: string;
  order: number;
}

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Connect to MongoDB
connectDB();

// Routes
// Get all items and folders
app.get('/api/data', async (req, res) => {
  try {
    const items = await Item.find().sort('order');
    const folders = await Folder.find().sort('order');
    res.json({ items, folders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Create new item
app.post('/api/items', async (req, res) => {
  try {
    const count = await Item.countDocuments({ folderId: req.body.folderId || null });
    const newItem = new Item({
      ...req.body,
      order: count,
    });
    const savedItem = await newItem.save();
    
    io.emit('item:create', savedItem);
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating item', error });
  }
});

// Create new folder
app.post('/api/folders', async (req, res) => {
  try {
    const count = await Folder.countDocuments();
    const newFolder = new Folder({
      ...req.body,
      order: count,
    });
    const savedFolder = await newFolder.save();
    
    io.emit('folder:create', savedFolder);
    res.status(201).json(savedFolder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating folder', error });
  }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    io.emit('item:update', updatedItem);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error });
  }
});

// Update folder
app.put('/api/folders/:id', async (req, res) => {
  try {
    const updatedFolder = await Folder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    io.emit('folder:update', updatedFolder);
    res.json(updatedFolder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating folder', error });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    
    io.emit('item:delete', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting item', error });
  }
});

// Delete folder and its items
app.delete('/api/folders/:id', async (req, res) => {
  try {
    const folderId = req.params.id;
    
    // Delete all items in the folder
    await Item.deleteMany({ folderId });
    
    // Delete the folder
    await Folder.findByIdAndDelete(folderId);
    
    io.emit('folder:delete', folderId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting folder', error });
  }
});

// Handle reordering
app.put('/api/reorder', async (req, res) => {
  try {
    const { items, folders } = req.body;
    
    // Update items
    if (items && items.length > 0) {
      const updates = items.map(({ id, order, folderId }: ReorderItemData) => 
        Item.findByIdAndUpdate(id, { order, folderId })
      );
      await Promise.all(updates);
    }
    
    // Update folders
    if (folders && folders.length > 0) {
      const updates = folders.map(({ id, order }: ReorderFolderData) => 
        Folder.findByIdAndUpdate(id, { order })
      );
      await Promise.all(updates);
    }
    
    io.emit('reorder', req.body);
    res.status(200).json({ message: 'Reorder successful' });
  } catch (error) {
    res.status(400).json({ message: 'Error reordering', error });
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // Client disconnected event
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}); 