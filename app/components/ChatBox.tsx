"use client";

import { useEffect, useState } from "react";
import { db } from "@/utils/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface ChatMessage {
  user: string;
  text: string;
  createdAt: Timestamp | null;
}

export default function ChatBox({ roomId }: { roomId: string }) {
  const [username, setUsername] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Get username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Subscribe to messages
  useEffect(() => {
    const q = query(
      collection(db, "chats", roomId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data() as ChatMessage));
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!input.trim() || !username) return;

    await addDoc(collection(db, "chats", roomId, "messages"), {
      user: username,
      text: input,
      createdAt: Timestamp.now(),
    });

    setInput("");
  };

 

  if (!username) {
    return (
      <div className="w-80 p-4 text-sm text-gray-500 bg-white border rounded shadow fixed bottom-4 right-4 z-50">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border rounded shadow p-4 text-black fixed bottom-4 right-4 z-50">
      <h2 className="text-lg font-semibold mb-3">💬 Chat</h2>

      {/* Messages */}
      <div className="h-64 overflow-y-auto bg-gray-100 p-3 mb-3 rounded space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm"
          >
            <div className="text-blue-600 font-bold text-xs mb-1">{msg.user}</div>
            <div className="text-gray-800">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input + Send */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded text-black"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>

      
    </div>
  );
}
