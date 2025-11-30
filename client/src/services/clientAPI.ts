// src/services/clientAPI.ts

// Build API base from env (Vite or CRA), with /api suffix
function getApiBase(): string {
  const vite = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) || "";
  const cra  = (process.env.REACT_APP_API_BASE as string) || "";
  const raw  = (vite || cra || "http://localhost:8000").trim();
  const noSlash = raw.replace(/\/+$/, "");
  return `${noSlash}/api`;
}

const API_BASE = getApiBase();

// Common header helper for authenticated requests
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

export const clientAPI = {
  // Current user
  getCurrentUser: () =>
    fetch(`${API_BASE}/auth/user/`, { headers: authHeaders() }).then(handle),

  // Client tasks
  getTasks: () =>
    fetch(`${API_BASE}/tasks/`, { headers: authHeaders() }).then(handle),

  getTask: (id: string | number) =>
    fetch(`${API_BASE}/tasks/${id}/`, { headers: authHeaders() }).then(handle),

  createTask: (data: any) =>
    fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  updateTask: (id: string | number, data: any) =>
    fetch(`${API_BASE}/tasks/${id}/`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  // Budget negotiation (client)
  acceptBudget: (id: string | number) =>
    fetch(`${API_BASE}/tasks/${id}/accept-budget/`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  counterBudget: (id: string | number, amount: number, reason = "") =>
    fetch(`${API_BASE}/tasks/${id}/counter-budget/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount, reason }),
    }).then(handle),

  rejectBudget: (id: string | number) =>
    fetch(`${API_BASE}/tasks/${id}/reject-budget/`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  withdrawTask: (id: string | number, reason = "") =>
    fetch(`${API_BASE}/tasks/${id}/withdraw/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handle),

  approveTask: (id: string | number) =>
    fetch(`${API_BASE}/tasks/${id}/approve/`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  requestRevision: (id: string | number, feedback: string) =>
    fetch(`${API_BASE}/tasks/${id}/request-revision/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    }).then(handle),

  // Chat
  getMessages: (taskId: string | number) =>
    fetch(`${API_BASE}/tasks/${taskId}/chat/`, { headers: authHeaders() }).then(handle),

  sendMessage: (taskId: string | number, messageData: any) =>
    fetch(`${API_BASE}/tasks/${taskId}/chat/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(messageData),
    }).then(handle),

  // Notifications
  getNotifications: () =>
    fetch(`${API_BASE}/notifications/`, { headers: authHeaders() }).then(handle),

  markNotificationRead: (id: string | number) =>
    fetch(`${API_BASE}/notifications/${id}/read/`, {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),
};

export default clientAPI;
  