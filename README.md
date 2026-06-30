# Backend Notification System

## Overview
This project is a solution for the Backend Track assessment. It includes a reusable logging middleware, notification system design documentation, and a priority inbox implementation.

## Tech Stack
- Node.js
- Express.js
- Axios
- Dotenv

## Project Structure

```
backend-logging-service/
│
├── src/
│   ├── middleware/
│   │   └── logger.js
│   └── server.js
│
├── notification_system/
│   ├── notification_system_design.md
│   └── priority_inbox.js
│
├── vehicle_scheduling_be/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Installation

```bash
npm install
```

## Run Logging Middleware

```bash
npm run dev
```

## Run Priority Inbox

```bash
node notification_system/priority_inbox.js
```

## Features

- Reusable logging middleware
- Notification system design (Stages 1–5)
- Priority inbox implementation (Stage 6)
- API integration with evaluation server