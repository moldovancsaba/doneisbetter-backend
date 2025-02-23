# Hello World App - Getting Started Guide

## Overview

This guide provides the necessary steps to start a new project with a simple Hello World app that includes:

- **Frontend**: Next.js
- **Backend**: Node.js with Express and Socket.IO
- **Database**: MongoDB Atlas with real-time communication

All components communicate in real-time. The first function of this Hello World app is to allow users to add cards to a single column, which is stored in MongoDB and synchronized across all devices.

---

## Prerequisites

Make sure the following tools are installed on your local development environment:

- **Homebrew** (for macOS package management)
- **Node.js** (Latest LTS version)
- **npm** (comes with Node.js)
- **mongosh** (MongoDB Shell) - Install using:
  ```bash
  brew install mongosh
  ```

---

## Project Structure

```
/Users/moldovan/Projects/doneisbetter
├── backend       # Node.js with Express and Socket.IO
└── frontend      # Next.js with Axios and Socket.IO Client
```

---

## Required Accounts and Services

1. **GitHub Repository**

   - URL: [https://github.com/moldovancsaba/doneisbetter](https://github.com/moldovancsaba/doneisbetter)
   - Branching Strategy: Use branches for iteration and maintain rollback capability.

2. **Vercel**

   - Frontend: [https://vercel.com/narimato/doneisbetter-frontend](https://vercel.com/narimato/doneisbetter-frontend)
   - Backend: [https://vercel.com/narimato/doneisbetter-backend](https://vercel.com/narimato/doneisbetter-backend)

3. **MongoDB Atlas**

   - Connection String: `mongodb+srv://thanperfect:CuW54NNNFKnGQtt6@doneisbetter.49s2z.mongodb.net/?retryWrites=true&w=majority&appName=doneisbetter`

---

## Development and Deployment Rules

- **Local Environment**: Develop and test locally.
- **GitHub**: Use branches effectively to enable iteration and rollbacks.
- **Vercel**: Deploy only when ready for production. Deployments are triggered from GitHub pushes to the main branch.
- **Documentation**:
  - Precise, professional, and simple.
  - In `.md` format for GitHub readability.
  - Updated after every successful and approved step.

---

## Command Rules

- **No ****`#`**** comments** in bash commands to avoid terminal clutter.
- **Absolute paths** are mandatory for folder navigation.
- **Full file edits** must be done using terminal commands—manual editing is not allowed.
- **Commands must be error-free** and compatible with macOS 15.3 on Mac M1.
- **Handle special characters** carefully in terminal commands, especially for multi-line edits.

---

## done is better than perfect

