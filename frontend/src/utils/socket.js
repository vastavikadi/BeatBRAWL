// utils/socket.js - First, let's improve the socket utility
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // Create socket with reconnection options
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });
    
    console.log("Socket initialized");
  }
  
  return socket;
};

export const reconnectSocket = () => {
  if (socket) {
    // Force a reconnection if socket exists but is disconnected
    if (!socket.connected) {
      console.log("Attempting to reconnect socket...");
      socket.connect();
    }
  } else {
    // Create a new socket if it doesn't exist
    socket = getSocket();
  }
  
  return socket;
};