import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, { transports: ['websocket', 'polling'] });

export default function Home() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
    socket.on('tasksUpdated', () => {
      fetchTasks();
    });

    return () => {
      socket.off('tasksUpdated');
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
      setTasks(response.data.todo);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (task.trim() === '') return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, { task });
      setTask('');
      socket.emit('tasksUpdated');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Hello World App</h1>
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="p-4 bg-white rounded shadow">
              {task}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
