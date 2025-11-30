// src/services/websocketService.ts

/**
 * Resolve WS base URL from env (Vite or CRA).
 * - Vite:  VITE_WS_BASE
 * - CRA:   REACT_APP_WS_BASE
 * Fallback: derive from window.origin (http->ws, https->wss).
 */
function getWsBase(): string {
  // Try Vite env
  const viteWs = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WS_BASE) || "";
  // Try CRA env
  const craWs = (process.env.REACT_APP_WS_BASE as string) || "";
  let base = (viteWs || craWs || "").trim();

  // Final fallback: build from current page origin
  if (!base) {
    base = window.location.origin.replace(/^http/, "ws");
  }

  // normalize: no trailing slash
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/** Safe join for base + path */
function joinWsUrl(base: string, path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return base + path;
}

/** Append ?token=... (or &token=...) */
function withToken(url: string, token?: string): string {
  if (!token) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(token)}`;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageCallbacks: Map<string, Function[]> = new Map();
  private taskCallbacks: Map<string, Function[]> = new Map();

  // Adjust these two paths ONLY if your backend uses different routes
  private adminPath = "/ws/admin/";         // matches your Channels routing
  private taskPath = (taskId: string) => `/ws/task/${taskId}/`; // matches your current usage

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const base = getWsBase();
    const url = withToken(joinWsUrl(base, this.adminPath), token);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket disconnected:", event);
      this.handleReconnect(token);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(token);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case "task_created":
        this.notifyTaskCallbacks("task_created", data.task);
        break;
      case "task_updated":
        this.notifyTaskCallbacks("task_updated", data.task);
        break;
      case "chat_message":
        this.notifyMessageCallbacks("chat_message", data.message);
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  }

  // Task event listeners
  onTaskCreated(callback: (task: any) => void) {
    this.addCallback("task_created", callback);
  }

  onTaskUpdated(callback: (task: any) => void) {
    this.addCallback("task_updated", callback);
  }

  // Message event listeners
  onChatMessage(callback: (message: any) => void) {
    this.addCallback("chat_message", callback);
  }

  private addCallback(type: string, callback: Function) {
    if (!this.taskCallbacks.has(type)) {
      this.taskCallbacks.set(type, []);
    }
    this.taskCallbacks.get(type)!.push(callback);
  }

  private notifyTaskCallbacks(type: string, data: any) {
    const callbacks = this.taskCallbacks.get(type) || [];
    callbacks.forEach((cb) => cb(data));
  }

  private notifyMessageCallbacks(type: string, data: any) {
    const callbacks = this.messageCallbacks.get(type) || [];
    callbacks.forEach((cb) => cb(data));
  }

  // Connect to specific task for chat
  connectToTask(taskId: string, token: string) {
    const base = getWsBase();
    const path = this.taskPath(taskId);
    const url = withToken(joinWsUrl(base, path), token);

    const taskSocket = new WebSocket(url);

    taskSocket.onopen = () => {
      console.log(`Connected to task ${taskId}`);
    };

    taskSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        this.notifyMessageCallbacks("chat_message", data.message);
      } else if (data.type === "task_updated") {
        this.notifyTaskCallbacks("task_updated", data.task);
      }
    };

    taskSocket.onclose = () => {
      console.log(`Disconnected from task ${taskId}`);
    };

    return taskSocket;
  }

  // Send chat message
  sendChatMessage(taskSocket: WebSocket, message: string, file?: File) {
    if (taskSocket.readyState === WebSocket.OPEN) {
      taskSocket.send(
        JSON.stringify({
          type: "chat_message",
          message: message,
          file: file ? file.name : null,
        })
      );
    }
  }

  // Send typing indicator
  sendTypingIndicator(taskSocket: WebSocket, isTyping: boolean) {
    if (taskSocket.readyState === WebSocket.OPEN) {
      taskSocket.send(
        JSON.stringify({
          type: "typing",
          is_typing: isTyping,
        })
      );
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
