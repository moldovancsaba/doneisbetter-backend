# DoneIsBetter - Card Management System

Last updated: 2025-02-25T07:39:26+01:00

A simple, MongoDB-backed card management system built with React, TypeScript, and Express. This project serves as a foundation for card-based applications.

## Project Overview

This project implements a simple yet scalable card management system with:
- Google-style search input for card creation
- Real-time card updates
- MongoDB Atlas backend integration
- Full TypeScript support
- Vercel deployment ready

## Tech Stack

### Frontend
- React with TypeScript
- Vite build tool
- @emotion/styled for styling
- Vercel deployment

### Backend
- Node.js with TypeScript
- Express.js
- MongoDB Atlas
- CORS enabled API

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd doneisbetter
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:
- Create `.env` in backend directory
- Add MongoDB connection string:
    ```
    MONGODB_URI=your_mongodb_connection_string
    ```

4. Start development servers:
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## Deployment

### Frontend (Vercel)
1. Create new project on Vercel
2. Import your repository
3. Vercel will auto-detect Vite configuration
4. Deploy

### Backend
1. Set up MongoDB Atlas:
- Create cluster
- Set up database user
- Add IP access
- Get connection string
2. Deploy backend to preferred platform
3. Update frontend API endpoint

## Development Guidelines

- Keep components simple and focused
- Use TypeScript types consistently
- Follow REST API best practices
- Maintain error handling throughout
- Document new features

## Troubleshooting

1. MongoDB Connection Issues:
- Verify connection string
- Check IP whitelist
- Verify user credentials

2. Build Issues:
- Clear node_modules and reinstall
- Verify TypeScript config
- Check for lint errors

3. Deployment Issues:
- Verify environment variables
- Check build logs
- Ensure CORS is configured

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Open pull request

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
