// src/pages/ClientTaskList.tsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  X,
  Minimize2,
  Download,
  CheckCircle,
  RotateCcw,
  Send,
  Plus,
  MessageCircle,
  Globe,
  XCircle,
  Paperclip,
  AlertCircle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const GLOBAL_TIMEZONES = [
  { city: "London", country: "UK", zone: "Europe/London", flag: "GB", offset: "GMT" },
  { city: "New York", country: "USA", zone: "America/New_York", flag: "US", offset: "ET" },
  { city: "Los Angeles", country: "USA", zone: "America/Los，您_Angeles", flag: "US", offset: "PT" },
  { city: "Toronto", country: "Canada", zone: "America/Toronto", flag: "CA", offset: "ET" },
  { city: "Paris", country: "France", zone: "Europe/Paris", flag: "FR", offset: "CET" },
  { city: "Berlin", country: "Germany", zone: "Europe/Berlin", flag: "DE", offset: "CET" },
  { city: "Dubai", country: "UAE", zone: "Asia/Dubai", flag: "AE", offset: "GST" },
  { city: "Mumbai", country: "India", zone: "Asia/Kolkata", flag: "IN", offset: "IST" },
  { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", flag: "SG", offset: "SGT" },
  { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", flag: "JP", offset: "JST" },
  { city: "Sydney", country: "Australia", zone: "Australia/Sydney", flag: "AU", offset: "AEDT" },
  { city: "Nairobi", country: "Kenya", zone: "Africa/Nairobi", flag: "KE", offset: "EAT" },
  { city: "Lagos", country: "Nigeria", zone: "Africa/Lagos", flag: "NG", offset: "WAT" },
];

interface Task {
  id: number;
  title: string;
  description: string;
  subject: string;
  category: { id: number; name: string } | null;
  status: "Submitted" | "In Progress" | "Awaiting Review" | "Revision Requested" | "Completed" | "Cancelled";
  deadline: string;
  timezone_obj: { zone: string; city: string; country: string; flag: string; offset: string };
  education_level: string;
  file_url?: string;
  response_file_url?: string;
  revision_note?: string;
  revision_file_url?: string;
  cancel_reason?: string;
  chat: { sender: "Client" | "Admin"; message: string; time: string; file_url?: string }[];
  unread_messages: number;
}

const getStatusConfig = (status: string) => {
  const map: Record<string, { color: string; icon: any; label: string }> = {
    Submitted: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Submitted" },
    "In Progress": { color: "bg-blue-100 text-blue-800", icon: Clock, label: "In Progress" },
    "Awaiting Review": { color: "bg-purple-100 text-purple-800", icon: FileText, label: "Awaiting Review" },
    "Revision Requested": { color: "bg-orange-100 text-orange-800", icon: AlertCircle, label: "Revision" },
    Completed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, label: "Completed" },
    Cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
  };
  return map[status] || { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };
};

const TaskCard = ({ task, openChat, handleApprove, openRevisionModal, openCancelModal }: any) => {
  const status = getStatusConfig(task.status);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="font-mono text-emerald-600 text-sm">#{task.id}</span>
            <span className="truncate max-w-52">{task.title}</span>
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1"><User size={13} /> You</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
          <StatusIcon size={14} />
          {status.label}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{task.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-5">
        <div className="bg-gray-50 px-3 py-2 rounded-xl"><p className="text-gray-500">Subject</p><p className="font-medium text-gray-900 truncate">{task.subject}</p></div>
        <div className="bg-gray-50 px-3 py-2 rounded-xl"><p className="text-gray-500">Level</p><p className="font-medium text-gray-900">{task.education_level}</p></div>
        <div className="bg-gray-50 px-3 py-2 rounded-xl"><p className="text-gray-500">Deadline</p><p className="font-medium text-gray-900 text-right">
          {new Date(task.deadline).toLocaleString("en-GB", { timeZone: task.timezone_obj.zone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p></div>
      </div>

      {task.cancel_reason && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl mb-3 flex items-start gap-2 text-xs">
          <XCircle size={16} className="mt-0.5" />
          <div><p className="font-medium">Cancelled</p><p className="truncate">{task.cancel_reason}</p></div>
        </div>
      )}

      {task.revision_note && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-xl mb-3 flex items-start gap-2 text-xs">
          <AlertCircle size={16} className="mt-0.5" />
          <div><p className="font-medium">Revision Requested</p><p className="truncate">{task.revision_note}</p></div>
        </div>
      )}

      {task.unread_messages > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-red-600">{task.unread_messages} new</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => openChat(task.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
          <MessageCircle size={15} className="mr-1.5" /> Chat
        </Button>

        {task.response_file_url && (
          <Button size="sm" variant="outline" onClick={() => window.open(task.response_file_url, "_blank")} className="border-emerald-300 text-emerald-700 text-xs font-medium">
            <Download size={15} className="mr-1.5" /> File
          </Button>
        )}

        {task.status === "Awaiting Review" && (
          <>
            <Button size="sm" onClick={() => handleApprove(task.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium">
              <CheckCircle size={15} className="mr-1.5" /> Approve
            </Button>
            <Button size="sm" onClick={() => openRevisionModal(task.id)} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium">
              <RotateCcw size={15} className="mr-1.5" /> Revise
            </Button>
          </>
        )}

        {task.status !== "Completed" && task.status !== "Cancelled" && (
          <Button 
            size="sm" 
            onClick={() => openCancelModal(task.id)} 
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
          >
            <XCircle size={15} className="mr-1.5" /> Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({ task, closeChat, handleSendMessage, zIndex, bringToFront, isMinimized, setMinimized }: any) => {
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current && !isMinimized) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [task.chat, isMinimized]);

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-xl cursor-pointer z-50 text-xs font-medium flex items-center gap-2"
        style={{ zIndex }}
        onClick={() => { setMinimized(false); bringToFront(); }}
      >
        <MessageCircle size={15} />
        {task.title.substring(0, 18)}...
      </div>
    );
  }

  return (
    <Draggable handle=".chat-handle" onMouseDown={bringToFront}>
      <ResizableBox
        width={360}
        height={520}
        minConstraints={[300, 380]}
        maxConstraints={[400, 650]}
        className="fixed bottom-8 right-8"
        style={{ zIndex }}
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="chat-handle cursor-move px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="max-w-44">
                <p className="text-xs font-bold truncate">{task.title}</p>
                <p className="text-xs opacity-80">Support</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-white/20 rounded-lg transition"><Minimize2 size={15} /></button>
              <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={15} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-3 space-y-2 text-xs">
            {task.chat.map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.sender === "Client" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-xs ${msg.sender === "Client" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <p className="font-medium text-xs">{msg.sender === "Client" ? "You" : "Support"}</p>
                  <p className="mt-0.5">{msg.message}</p>
                  {msg.file_url && <a href={msg.file_url} target="_blank" className="text-xs underline opacity-80 mt-1 block">View file</a>}
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(task.id, message); setMessage(""); }} className="p-2.5 bg-gray-50 border-t">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-full text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"><Send size={16} /></button>
            </div>
          </form>
        </div>
      </ResizableBox>
    </Draggable>
  );
};

const RevisionModal = ({ isOpen, onClose, taskId, onRevision }: any) => {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!note.trim()) return alert("Please add a revision note");
    onRevision(taskId, note, file);
    setNote("");
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <DialogPanel className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
        <DialogTitle className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2">
          <RotateCcw size={24} /> Request Revision
        </DialogTitle>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What needs improvement?"
          rows={4}
          className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 text-sm resize-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mt-3 px-4 py-2 border-2 border-dashed border-orange-300 rounded-xl file:mr-4 file:py-1.5 file:px-5 file:rounded-full file:bg-orange-600 file:text-white text-xs"
        />
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white text-sm" size="sm">Send</Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

const CancelModal = ({ isOpen, onClose, taskId, onCancel }: any) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Please provide a reason");
    await onCancel(taskId, reason);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <DialogPanel className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
        <DialogTitle className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">
          <XCircle size={24} /> Cancel Task
        </DialogTitle>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why are you cancelling?"
          rows={4}
          className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 text-sm resize-none"
        />
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white text-sm" size="sm">Confirm</Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAddTask }: any) => {
  const [selectedTimezone, setSelectedTimezone] = useState("");

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const found = GLOBAL_TIMEZONES.find(tz => tz.zone === detected);
    if (found) setSelectedTimezone(found.zone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const token = localStorage.getItem('access_token');

    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const deadline = `${date}T${time}:00`;

    formData.delete('date');
    formData.delete('time');
    formData.append('deadline', deadline);

    // ← THE ONLY FIX NEEDED (was 'timezone', now 'timezone_str')
    formData.set('timezone_str', selectedTimezone);

    try {
      const response = await fetch(`${API_BASE}/api/tasks/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        const newTask: Task = {
          ...result,
          chat: [],
          unread_messages: 0,
          category: result.category || null,
          timezone_obj: result.timezone_obj || GLOBAL_TIMEZONES.find(tz => tz.zone === selectedTimezone)!
        };
        onAddTask(newTask);
        form.reset();
        onClose();
      } else {
        alert('Validation failed: ' + JSON.stringify(result));
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <DialogPanel className="bg-white rounded-3xl p-7 w-full max-w-2xl shadow-2xl max-h-screen overflow-y-auto">
        <DialogTitle className="text-xl font-bold text-emerald-600 mb-5 flex items-center gap-2">
          <Plus size={24} /> Post New Task
        </DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm" encType="multipart/form-data">
          <select name="subject" required className="w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500">
            <option value="">Select Subject</option>
            {["Arts & Humanities","Mathematics & Statistics","Other Sciences","Health Sciences & Medicine","Technology & Computer Science","Business,Management & Economics","Law & Legal Studies","Education","Agriculture & Food Sciences","Others"].map(s => <option key={s}>{s}</option>)}
          </select>
          <input name="title" placeholder="Task Title" required className="w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500" />
          <textarea name="description" placeholder="Brief description (max 20 words)" rows={2} required className="w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 resize-none" maxLength={80} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" name="date" required className="px-4 py-3 border-2 rounded-xl" />
            <input type="time" name="time" required className="px-4 py-3 border-2 rounded-xl" />
          </div>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 text-sm font-medium"
          >
            <option value="" disabled>Select your city</option>
            {GLOBAL_TIMEZONES.map(tz => (
              <option key={tz.zone} value={tz.zone}>
                {tz.flag} {tz.city}, {tz.country} ({tz.offset})
              </option>
            ))}
          </select>
          <select name="education_level" required className="w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500">
            <option value="">Education Level</option>
            {["High School", "Diploma", "Bachelor's", "Master's", "PhD"].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <input type="file" name="file" required className="w-full px-4 py-3 border-2 border-dashed rounded-xl file:mr-4 file:py-2 file:px-6 file:rounded-full file:bg-emerald-600 file:text-white text-xs" />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm" size="sm">Submit</Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};

const ClientTaskList: React.FC = () => {
  const [currentUser, setCurrentUser] = useState("");
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [revisionTaskId, setRevisionTaskId] = useState<number | null>(null);
  const [cancelTaskId, setCancelTaskId] = useState<number | null>(null);
  const [chatZIndex, setChatZIndex] = useState(1000);

  // Fetch Tasks
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const normalized = data.map((t: any) => ({
          ...t,
          chat: t.chat || [],
          unread_messages: t.unread_messages || 0,
          category: t.category || null,
          timezone_obj: t.timezone_obj || { zone: "UTC", city: "UTC", country: "World", flag: "UN", offset: "UTC" }
        }));
        setTasks(normalized);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  // Fetch Current User
  useEffect(() => {
    const fetchUser = async () => {
      setIsUserLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsUserLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/auth/user/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data?.username || "User");
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  const openChat = (id: number) => {
    if (activeChatId === id) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, unread_messages: 0 } : t));
    setActiveChatId(id);
    setIsChatMinimized(false);
    setChatZIndex(prev => prev + 1);
  };

  const closeChat = () => setActiveChatId(null);

  const handleSendMessage = (taskId: number, msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, chat: [...t.chat, { sender: "Client", message: msg, time }] } : t));
  };

  const handleApprove = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Completed" } : t));
  };

  const handleRevision = (id: number, note: string, file: File | null) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: "Revision Requested", revision_note: note, revision_file_url: file ? URL.createObjectURL(file) : undefined }
        : t
    ));
  };

  const handleCancel = async (id: number, reason: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancel_reason: reason })
      });

      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Cancelled", cancel_reason: reason } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeTask = tasks.find(t => t.id === activeChatId);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    review: tasks.filter(t => t.status === "Awaiting Review").length,
    completed: tasks.filter(t => t.status === "Completed").length,
    cancelled: tasks.filter(t => t.status === "Cancelled").length,
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2 rounded-xl">
                  <FileText size={28} />
                </span>
                My Task Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-2">Global • Real-time • Full Control</p>
            </div>

            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {isUserLoading ? (
                  <div className="animate-spin">⟳</div>
                ) : currentUser ? (
                  currentUser.charAt(0).toUpperCase()
                ) : (
                  "?"
                )}
              </div>
              <p className="font-semibold text-gray-900">
                {isUserLoading ? "Loading..." : currentUser || "Guest"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
            {[
              { label: "Total", value: stats.total, color: "from-gray-500 to-gray-600" },
              { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-cyan-600" },
              { label: "Review", value: stats.review, color: "from-purple-500 to-indigo-600" },
              { label: "Completed", value: stats.completed, color: "from-emerald-500 to-teal-600" },
              { label: "Cancelled", value: stats.cancelled, color: "from-red-500 to-rose-600" },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <p className="text-xs font-medium opacity-90">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8">
            <p className="text-lg font-semibold text-gray-800">{tasks.length} Active Tasks</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-6 py-3 text-sm flex items-center gap-2">
              <Plus size={18} /> Post New Task
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                openChat={openChat}
                handleApprove={handleApprove}
                openRevisionModal={(id: number) => { setRevisionTaskId(id); setShowRevisionModal(true); }}
                openCancelModal={(id: number) => { setCancelTaskId(id); setShowCancelModal(true); }}
              />
            ))}
          </div>
        </div>
      </main>

      {activeTask && (
        <ChatWindow
          task={activeTask}
          closeChat={closeChat}
          handleSendMessage={handleSendMessage}
          zIndex={chatZIndex}
          bringToFront={() => setChatZIndex(prev => prev + 1)}
          isMinimized={isChatMinimized}
          setMinimized={setIsChatMinimized}
        />
      )}

      <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddTask={(t: Task) => setTasks(prev => [t, ...prev])} />
      <RevisionModal isOpen={showRevisionModal} onClose={() => { setShowRevisionModal(false); setRevisionTaskId(null); }} taskId={revisionTaskId} onRevision={handleRevision} />
      <CancelModal isOpen={showCancelModal} onClose={() => { setShowCancelModal(false); setCancelTaskId(null); }} taskId={cancelTaskId} onCancel={handleCancel} />
    </div>
  );
};

export default ClientTaskList;