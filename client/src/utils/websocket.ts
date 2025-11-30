// src/utils/websocket.ts
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;

type MessageHandler = (data: any) => void;

const handlers: MessageHandler[] = [];

export const connectWebSocket = (onMessage: MessageHandler) => {
  if (socket?.readyState === WebSocket.OPEN) {
    return;
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No token found. WebSocket not connecting.');
    return;
  }

  const wsUrl = `ws://127.0.0.1:8000/ws/tasks/?token=${token}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    handlers.forEach(handler => onMessage({ type: 'connected' }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.forEach(handler => handler(data));
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    if (reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        reconnectAttempts++;
        console.log(`Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`);
        connectWebSocket(onMessage);
      }, reconnectDelay * reconnectAttempts);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Register handler
  handlers.push(onMessage);
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  handlers.length = 0;
};

export const sendMessage = (taskId: number, message: string) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'chat_message',
      task_id: taskId,
      message
    }));
  }
};

export const joinTaskRoom = (taskId: number) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'join_task',
      task_id: taskId
    }));
  }
};

export const leaveTaskRoom = (taskId: number) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'leave_task',
      task_id: taskId
    }));
  }
};