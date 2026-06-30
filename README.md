# Backend Notification System

## Overview

This repository contains the solution for the Backend Track assessment. It includes a reusable logging middleware, a vehicle maintenance scheduler microservice, a notification system design covering Stages 1–6, and a priority inbox implementation that ranks notifications based on priority and recency.

## Tech Stack
- Node.js
- Express.js
- Axios
- Dotenv

## Project Structure

```text
backend-logging-service/
│
├── src/
│   ├── middleware/
│   │   └── logger.js
│   └── server.js
│
├── notification_system/
│   ├── notification_system_design.md
│   ├── priority_inbox.js
│   └── screenshots/
│       ├── priority_output(1).png
│       └── priority_output(2).png
│
├── vehicle_scheduling_be/
│   ├── scheduler.js
│   ├── README.md
│   └── screenshots/
│       ├── scheduler_output.png
│       └── scheduler_output(2).png
│
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

- Notification system design (Stages 1–6)
- Vehicle Maintenance Scheduler implementation
- Priority Inbox implementation
- Reusable logging middleware
- API integration with evaluation server