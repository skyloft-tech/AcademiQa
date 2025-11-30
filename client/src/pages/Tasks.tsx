// src/pages/Tasks.tsx — FINAL & PERFECT (November 18, 2025)
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  X,
  MessageCircle as Chat,
  Download,
  Upload,
  XCircle,
  CheckCircle,
  Send,
  Minimize2,
  AlertCircle,
  Clock,
  User,
  FileText,
  RefreshCw,
  Search,
  Paperclip,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const API_BASE = "http://localhost:8000";

interface Task {
  id: number;
  task_id: string;
  title: string;
  description: string;
  client: { id: number; username: string };
  subject: string;
  category: { id: number; name: string } | null;
  status: "Pending" | "In Progress" | "Submitted" | "Revision Requested" | "Completed" | "Rejected";
  deadline: string;
  timezone_obj: { zone: string; city: string; country: string; flag: string; offset: string } | null;
  education_level: string;
  file_url?: string;
  file_name?: string;
  solution_url?: string;
  solution_name?: string;
  revision_note?: string;
  revision_file_url?: string;
  reject_reason?: string;
  chat: { sender: "Client" | "Admin"; message: string; time: string; file_url?: string }[];
  unread_messages: number;
  created_at: string;
}

const getStatusConfig = (status: string) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    Pending: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" },
    "In Progress": { color: "bg-blue-100 text-blue-800", icon: RefreshCw, label: "In Progress" },
    Submitted: { color: "bg-purple-100 text-purple-800", icon: FileText, label: "Submitted" },
    "Revision Requested": { color: "bg-orange-100 text-orange-800", icon: AlertCircle, label: "Revision" },
    Completed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, label: "Completed" },
    Rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" },
  };
  return config[status] || { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDeadline = (deadline: string, zone: string | null, offset: string | null) => {
  const safeZone = zone || "UTC";
  const safeOffset = offset || "UTC";
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: safeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(deadline)) + ` ${safeOffset}`;
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chatZIndex, setChatZIndex] = useState(1000);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [activeUploadTaskId, setActiveUploadTaskId] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tasks/`, {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const acceptTask = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks/${id}/accept/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Accept task error:', errorData);
        alert(`Failed to accept task: ${errorData.error || errorData.detail || res.statusText}`);
      }
    } catch (err) {
      console.error('Accept task exception:', err);
      alert("Failed to accept task");
    }
  };

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;

    const handleChange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file || !activeUploadTaskId) return;

      setUploadingId(activeUploadTaskId);
      const formData = new FormData();
      formData.append("solution", file);

      try {
        const res = await fetch(`${API_BASE}/api/admin/tasks/${activeUploadTaskId}/upload-solution/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        if (res.ok) {
          const updated = await res.json();
          setTasks(prev => prev.map(t => t.id === activeUploadTaskId ? updated : t));
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Upload error:', errorData);
          alert(`Upload failed: ${errorData.error || errorData.detail || res.statusText}`);
        }
      } catch (err) {
        console.error('Upload exception:', err);
        alert("Upload failed");
      } finally {
        target.value = "";
        setUploadingId(null);
        setActiveUploadTaskId(null);
      }
    };

    input.addEventListener("change", handleChange);
    return () => input.removeEventListener("change", handleChange);
  }, [activeUploadTaskId]);

  const rejectTask = async () => {
    if (!rejectReason.trim() || !rejectTaskId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/tasks/${rejectTaskId}/reject/`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === rejectTaskId ? updated : t));
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Reject task error:', errorData);
        alert(`Failed to reject task: ${errorData.error || errorData.detail || res.statusText}`);
      }
      setShowRejectModal(false);
      setRejectTaskId(null);
      setRejectReason("");
    } catch (err) {
      console.error('Reject task exception:', err);
      alert("Failed to reject task");
    }
  };

  const openChat = (id: number) => {
    setActiveChatId(id);
    setIsChatMinimized(false);
    setChatZIndex(prev => prev + 1);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, unread_messages: 0 } : t));
  };

  const closeChat = () => setActiveChatId(null);

  const sendMessage = () => {
    if (!message.trim() || !activeChatId) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTasks(prev => prev.map(t => 
      t.id === activeChatId ? { ...t, chat: [...t.chat, { sender: "Admin", message, time }] } : t
    ));
    setMessage("");
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = tasks.filter(t => {
    const matchesSearch = [t.task_id, t.title, t.client.username, t.subject].some(f =>
      f?.toLowerCase().includes(filter.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTask = tasks.find(t => t.id === activeChatId);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    submitted: tasks.filter(t => t.status === "Submitted").length,
    revision: tasks.filter(t => t.status === "Revision Requested").length,
    completed: tasks.filter(t => t.status === "Completed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="animate-spin h-10 w-10 text-emerald-600 mb-3" />
            <p className="text-base font-medium text-gray-700">Loading Command Center...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-1.5 rounded-lg">
                    <FileText size={14} />
                  </span>
                  Assignment Command Center
                </h1>
                <p className="text-xs text-gray-500 mt-1">Enterprise Task Management • Real-time</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
                <div>
                  <p className="font-semibold text-xs text-gray-900">Admin</p>
                  <p className="text-[10px] text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              {[
                { label: "Total", value: stats.total, color: "from-gray-500 to-gray-600" },
                { label: "Pending", value: stats.pending, color: "from-yellow-500 to-amber-600" },
                { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-cyan-600" },
                { label: "Submitted", value: stats.submitted, color: "from-purple-500 to-indigo-600" },
                { label: "Revision", value: stats.revision, color: "from-orange-500 to-red-600" },
                { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-600" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-br ${s.color} text-white rounded-xl p-3 shadow-md transition-all duration-300`}
                >
                  <p className="text-[10px] font-medium opacity-90">{s.label}</p>
                  <p className="text-xl font-bold mt-0.5">{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search TSK ID, title, client..."
                  className="pl-10 pr-3 py-2 text-xs border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
                <option value="Revision Requested">Revision</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto">
            <input ref={fileInputRef} type="file" className="hidden" />

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No tasks found</h3>
                  <p className="text-xs text-gray-500">Try adjusting your search or status filter.</p>
                </div>
              ) : (
                filtered.map((task) => {
                  const status = getStatusConfig(task.status);
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 p-4 transition-all duration-300"
                    >
                      {task.unread_messages > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse z-10">
                          {task.unread_messages}
                        </span>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="font-mono text-emerald-600 text-sm">#{task.task_id}</span>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><User size={12} /> {task.client.username}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 text-sm leading-relaxed">{task.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs mb-4">
                        <div className="bg-gray-50 px-3 py-2 rounded-lg"><p className="text-gray-500">Subject</p><p className="font-medium text-gray-900">{task.subject}</p></div>
                        <div className="bg-gray-50 px-3 py-2 rounded-lg"><p className="text-gray-500">Level</p><p className="font-medium text-gray-900">{task.education_level}</p></div>
                        <div className="bg-gray-50 px-3 py-2 rounded-lg"><p className="text-gray-500">Category</p><p className="font-medium text-gray-900">{task.category?.name || "—"}</p></div>
                        <div className="bg-gray-50 px-3 py-2 rounded-lg"><p className="text-gray-500">Deadline</p><p className="font-medium text-gray-900">
                          {task.timezone_obj ? formatDeadline(task.deadline, task.timezone_obj.zone, task.timezone_obj.offset) : "No timezone"}
                        </p></div>
                      </div>

                      {task.reject_reason && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 flex items-start gap-2">
                          <XCircle size={14} className="mt-0.5" />
                          <div><p className="font-medium text-xs">Rejected</p><p className="text-xs">{task.reject_reason}</p></div>
                        </div>
                      )}

                      {task.revision_note && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg mb-3 flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5" />
                          <div><p className="font-medium text-xs">Revision Requested</p><p className="text-xs">{task.revision_note}</p></div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => openChat(task.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
                          <Chat size={14} className="mr-1" /> Chat
                        </Button>

                        {task.file_url && task.file_name && (
                          <Button size="sm" variant="outline" onClick={() => downloadFile(task.file_url!, task.file_name!)} className="border-gray-300 font-medium text-xs">
                            <Download size={14} className="mr-1" /> Client Brief
                          </Button>
                        )}

                        {task.status === "Pending" && (
                          <>
                            <Button size="sm" onClick={() => acceptTask(task.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                              <CheckCircle size={14} className="mr-1" /> Accept
                            </Button>
                            <Button size="sm" onClick={() => { setRejectTaskId(task.id); setShowRejectModal(true); }} className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs">
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        {(task.status === "Pending" || task.status === "In Progress" || task.status === "Revision Requested") && (
                          <Button
                            size="sm"
                            onClick={() => { setActiveUploadTaskId(task.id); fileInputRef.current?.click(); }}
                            disabled={uploadingId === task.id}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs"
                          >
                            <Paperclip size={14} className="mr-1" />
                            {uploadingId === task.id ? "Uploading..." : "Upload Solution"}
                          </Button>
                        )}

                        {task.status === "Rejected" && (
                          <Button size="sm" onClick={() => acceptTask(task.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                            <CheckCircle size={14} className="mr-1" /> Re-Accept
                          </Button>
                        )}

                        {task.solution_url && task.solution_name && (
                          <Button size="sm" variant="outline" onClick={() => downloadFile(task.solution_url!, task.solution_name!)} className="border-emerald-300 text-emerald-700 font-medium text-xs">
                            <Download size={14} className="mr-1" /> View Solution
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {activeTask && (
          <Draggable handle=".chat-handle">
            <ResizableBox width={340} height={500} minConstraints={[280, 60]} maxConstraints={[420, 700]} className="fixed bottom-5 right-5" style={{ zIndex: chatZIndex }}>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="chat-handle cursor-move px-3 py-2 flex justify-between items-center text-xs">
                  <div className="max-w-48">
                    <p className="font-bold truncate">{activeTask.title}</p>
                    <p className="opacity-80">{activeTask.client.username}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIsChatMinimized(!isChatMinimized)} className="p-1 hover:bg-white/20 rounded-lg transition">
                      <Minimize2 size={14} />
                    </button>
                    <button onClick={closeChat} className="p-1 hover:bg-white/20 rounded-lg transition">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {!isChatMinimized && (
                  <>
                    <div className="flex-1 overflow-y-auto bg-white p-3 space-y-2 text-xs">
                      {activeTask.chat.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "Client" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs px-2.5 py-1.5 rounded-xl text-[11px] ${msg.sender === "Client" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                            <p className="font-medium">{msg.sender === "Client" ? activeTask.client.username : "You"}</p>
                            <p className="mt-0.5">{msg.message}</p>
                            {msg.file_url && <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] underline opacity-80 mt-1 block">View file</a>}
                            <p className="text-[10px] opacity-70 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-2 bg-gray-50 border-t">
                      <div className="flex gap-2">
                        <input
                          ref={messageInputRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-1.5 rounded-full text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700 transition">
                          <Send size={14} />
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </ResizableBox>
          </Draggable>
        )}

        <Dialog open={showRejectModal} onClose={() => setShowRejectModal(false)}>
          <DialogPanel className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <DialogTitle className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
              <XCircle size={18} /> Reject Task
            </DialogTitle>
            <p className="text-xs text-gray-600 mb-4">A rejection reason is required and will notify the user.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this task is being rejected..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 text-xs resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectTaskId(null); setRejectReason(""); }} size="sm">Cancel</Button>
              <Button onClick={rejectTask} className="bg-red-600 hover:bg-red-700 text-white font-medium" size="sm" disabled={!rejectReason.trim()}>Confirm</Button>
            </div>
          </DialogPanel>
        </Dialog>
      </main>
    </div>
  );
}