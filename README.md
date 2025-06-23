# Chit-Chat 🌐⚡

Simple real-time chatting application

## Overview

Chit-Chat is a real-time chat application that allows users to communicate instantly. The application consists of a Node.js/Express backend and a React frontend.

## Project Structure

- **backend**: Node.js/Express server with WebSocket support
  - **controllers**: API endpoint handlers
  - **service**: Business logic
  - **repositories**: Data access layer
  - **models**: Data models (in-memory storage)
  - **__tests__**: Test files for the backend

- **frontend**: React application
  - **src**: Source code
  - **public**: Static assets

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

From the root directory:

```bash
# Start both backend and frontend
npm start

# Start only the backend
npm run start:server

# Start only the frontend
npm run start:client
```

## Testing

### Backend Tests

The backend includes a comprehensive test suite using Jest. To run the tests:

```bash
cd backend
npm test
```

For more detailed information about the tests, see the [backend test README](backend/__tests__/README.md).

## Contributing

When contributing to this project, please ensure that you write tests for any new features or bug fixes. Follow the existing test patterns and organization.
