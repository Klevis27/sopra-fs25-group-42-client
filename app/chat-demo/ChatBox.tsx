"use client"

import { useEffect, useState } from "react"
import { db } from "@/utils/firebaseConfig"

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore"

interface ChatMessage {
  user: string
  text: string
  createdAt: Timestamp | null
}

export default function ChatBox({ username, roomId }: { username: string; roomId: string }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const q = query(
      collection(db, "chats", roomId, "messages"),
      orderBy("createdAt")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data() as ChatMessage))
    })

    return () => unsubscribe()
  }, [roomId])

  const sendMessage = async () => {
    if (!input.trim()) return

    await addDoc(collection(db, "chats", roomId, "messages"), {
      user: username,
      text: input,
      createdAt: Timestamp.now(),
    })

    setInput("")
  }

  const clearMessages = async () => {
    const messagesRef = collection(db, "chats", roomId, "messages")
    const snapshot = await getDocs(messagesRef)

    const deletions = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "chats", roomId, "messages", docSnap.id))
    )

    await Promise.all(deletions)
  }

  return (
    <div className="max-w-xl mx-auto bg-white border rounded shadow p-4 text-black">
      <h2 className="text-xl font-semibold mb-4">💬 Live Chat</h2>

      {/* Message list */}
      <div className="h-64 overflow-y-auto bg-gray-100 p-4 mb-4 rounded space-y-2">
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

      {/* Input + Buttons */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded text-black"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
        <button
          onClick={clearMessages}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
