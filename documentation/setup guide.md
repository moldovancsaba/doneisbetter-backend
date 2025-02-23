# DoneIsBetter: Setup Guide

## Overview
DoneIsBetter is a simple Hello World app with the following functionality:
- A Google-like input field to add text as cards in a single column
- Cards are stored in MongoDB so they can be viewed anywhere, anytime
- Real-time synchronization: Cards added on one screen are instantly visible on all screens

## Prerequisites
Ensure you have the following tools installed:
- **macOS 15.3** on a Mac M1 computer
- **Node.js v22.14.0**
- **npm** (Comes with Node.js)
- **MongoDB Atlas Account**
- **Vercel Account**
- **GitHub Account**

## Initial Setup
### Step 1: Clear and Recreate Project Folder
```sh
cd /Users/moldovan/Projects/
rm -rf doneisbetter
mkdir doneisbetter
cd doneisbetter
```

### Step 2: Initialize GitHub Repository
```sh
git init
git remote add origin https://github.com/moldovancsaba/doneisbetter.git
```

### Step 3: Setup Backend
```sh
mkdir backend
cd backend
npm init -y
npm install express mongoose socket.io cors dotenv
```

### Step 4: Setup Frontend
```sh
cd /Users/moldovan/Projects/doneisbetter
mkdir frontend
cd frontend
npx create-next-app@latest . --use-npm --js
npm install socket.io-client axios
```

### Step 5: Environment Variables
Create a `.env.local` file in the frontend:
```sh
cat > /Users/moldovan/Projects/doneisbetter/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5001
EOF
```

Create a `.env` file in the backend:
```sh
cat > /Users/moldovan/Projects/doneisbetter/backend/.env << 'EOF'
MONGO_URI=mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/doneisbetter?retryWrites=true&w=majority
EOF
```

## Folder Structure
```
doneisbetter/
├── backend/
│   ├── server.js
│   └── models/
│       └── Task.js
└── frontend/
    ├── pages/
    │   └── index.js
    └── .env.local
```

## Running the Project Locally
```sh
cd /Users/moldovan/Projects/doneisbetter/backend
npm start

cd /Users/moldovan/Projects/doneisbetter/frontend
npm run dev
```

## Troubleshooting
- If you get `404` on adding tasks, ensure the backend route is defined as POST `/tasks`
- If MongoDB connection fails, check `.env` file and ensure the URI is correct.

## Deployment to Vercel
- Ensure the GitHub repository is connected to Vercel.
- Deploy only when local tests are successful.
- Use branches to manage deployments.

## Notes
- This is a **Hello World** app. Text like "Add a task" will be changed to "Add a card" later.
- Follow the rules consistently to avoid errors and confusion.

