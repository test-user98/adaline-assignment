# Real-time Item/Folder Organiser App

A real-time web application that allows users to organize items into folders with drag-and-drop functionality. Changes made in one session sync in real-time across all open sessions.

## Features

- Create items with title and icon
- Group items into folders
- Drag and drop to reorder items and folders
- Move items between folders
- Toggle folders between open and closed states
- Persistence of item arrangement and folder states
- Real-time syncing across multiple sessions

## Technology Stack

- **Frontend**: React, TypeScript, Material UI, react-beautiful-dnd (for drag and drop)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io (for real time session maintain)

## Prerequisites

Before you can run this application, you need to have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (I used mongoDB atlas cluster)

## Setup and Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd adaline-assignment
```

### 2. Install dependencies

For the server:
```bash
cd server
npm install
```

For the client:
```bash
cd ../client
npm install
```

### 3. Set up environment variables

For the server:
```bash
cd server
cp .env.example .env
```

For the client:
```bash
cd ../client
cp .env.example .env
```

You can modify the `.env` files according to your setup if needed.

### 4. Start MongoDB

Make sure MongoDB is running locally on default port (27017).

If you need to use a different MongoDB connection, update the `MONGODB_URI` in the server's `.env` file.

### 5. Start the server

```bash
cd ../server
npm run dev
```

The server will start at http://localhost:5000 (or the port specified in your .env file).

### 6. Start the client

In a new terminal:
```bash
cd ../client
npm start
```

The client application will open in your browser at http://localhost:3000.

## Usage

1. **Add new items or folders**: Click the "Add New" button in the top right or use the floating action button (FAB)
2. **Reorder items/folders**: Drag and drop items or folders to reposition them
3. **Move items to folders**: Drag items and drop them into folders
4. **Toggle folders**: Click the expand/collapse icon to show or hide folder contents
5. **Delete items/folders**: Click the delete icon on an item or folder

## Error Handling

The application includes error handling for:
- Network connectivity issues
- Failed API requests
- Database errors

If you encounter an error, you'll see an error message with an option to retry the operation.

## Notes

- The application automatically saves changes to the database
- If you have multiple browser tabs/windows open, changes in one will reflect in all others in real-time
- The application uses mongo DB atlas, cloud cluster for data storage, make sure MongoDB cluster is running and you are successfully connected before starting the server
