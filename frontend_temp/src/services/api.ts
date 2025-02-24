import axios from 'axios';

const api = axios.create({
    baseURL: 'https://doneisbetter-backend.vercel.app',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

