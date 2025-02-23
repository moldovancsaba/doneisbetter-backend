const Task = require('./models/Task');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/?retryWrites=true&w=majority&appName=doneisbetter';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Schema and Model
const CardSchema = new mongoose.Schema({
  text: String
});
const Card = mongoose.model('Card', CardSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World! Backend is running.');
});

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  Card.find()
    .then(cards => {
      socket.emit('cards', cards);
    })
    .catch(err => console.log('Error fetching cards:', err));

  socket.on('newCard', (text) => {
    const newCard = new Card({ text });
    newCard.save()
      .then(() => {
        io.emit('cards', [newCard]);
      })
      .catch(err => console.log('Error saving card:', err));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log('Fetched Tasks:', tasks); res.json({ todo: tasks.map(task => task.todo), inProgress: tasks.map(task => task.inProgress), done: tasks.map(task => task.done) });
  } catch (error) {
    console.error('Error fetching tasks:', error); console.log('Task Model:', Task);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/tasks', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task content is required' });
    }

    const newTask = new Task({ todo: task });
    await newTask.save();
    io.emit('tasksUpdated');
    res.status(201).json({ message: 'Task added successfully' });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
