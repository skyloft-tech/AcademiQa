// src/services/adminApi.ts
// Build API base from env (Vite or CRA)
function getApiBase(): string {
  const vite = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) || "";
  const cra = (process.env.REACT_APP_API_BASE as string) || "";
  const raw = (vite || cra || "http://localhost:8000").trim();
  const noSlash = raw.replace(/\/+$/, "");
  return `${noSlash}/api`; // ensure /api suffix
}

const API_BASE_URL = getApiBase();

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }
  return response.json();
}

const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async post(endpoint: string, data: any = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async upload(endpoint: string, formData: FormData) {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // let browser set multipart boundary
    });
    return handleResponse(response);
  },
};

// Admin-specific API endpoints
export const adminAPI = {
  // Tasks
  getTasks: () => apiClient.get("/tasks/"),
  getTask: (id: string) => apiClient.get(`/tasks/${id}/`),

  // Task Actions
  acceptTask: (taskId: string) => apiClient.post(`/admin/tasks/${taskId}/accept/`),
  rejectTask: (taskId: string, reason: string) =>
    apiClient.post(`/admin/tasks/${taskId}/reject/`, { reason }),

  // Budget Actions
  proposeBudget: (taskId: string, amount: number, reason: string) =>
    apiClient.post(`/admin/tasks/${taskId}/propose-budget/`, { amount, reason }),
  acceptBudget: (taskId: string) => apiClient.post(`/admin/tasks/${taskId}/accept-budget/`),

  // Progress & Workflow
  updateProgress: (taskId: string, progress: number, message?: string) =>
    apiClient.post(`/admin/tasks/${taskId}/update-progress/`, { progress, message }),
  submitForReview: (taskId: string) => apiClient.post(`/admin/tasks/${taskId}/submit-review/`),
  markComplete: (taskId: string) => apiClient.post(`/admin/tasks/${taskId}/mark-complete/`),

  // File Upload
  uploadSolution: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("solution", file);
    return apiClient.upload(`/admin/tasks/${taskId}/upload-solution/`, formData);
  },

  // Messages
  getMessages: (taskId: string) => apiClient.get(`/tasks/${taskId}/chat/`),
  sendMessage: (taskId: string, messageData: any) =>
    apiClient.post(`/tasks/${taskId}/chat/`, messageData),

  // Files
  uploadFile: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload(`/tasks/${taskId}/files/`, formData);
  },

  // Profile & Stats
  getProfile: () => apiClient.get("/auth/user/"),
  getStats: () => apiClient.get("/admin/stats/"),

  // Notifications
  getNotifications: () => apiClient.get("/notifications/"),
  markNotificationRead: (notificationId: string) =>
    apiClient.post(`/notifications/${notificationId}/read/`),
};

export default adminAPI;
