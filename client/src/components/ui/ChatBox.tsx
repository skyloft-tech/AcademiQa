import { useState } from "react";

interface ChatBoxProps {
  taskTitle: string;
  onClose: () => void;
}

export default function ChatBox({ taskTitle, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-lg w-80 max-h-[65vh] flex flex-col border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-lightBlue-500 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-sm">Chat – {taskTitle}</h3>
        <button onClick={onClose} className="text-white text-lg leading-none hover:text-gray-200">
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm text-gray-700">
        {messages.length === 0 ? (
          <p className="text-gray-400 italic text-center">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="bg-blue-100 p-2 rounded-md w-fit max-w-[80%]">
              {msg}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex border-t border-gray-300">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-3 bg-lightBlue-500 text-white text-sm font-semibold hover:bg-lightBlue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
