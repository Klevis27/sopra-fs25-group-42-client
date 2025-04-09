"use client"

import { useState } from "react"
import ChatBox from "./ChatBox"

export default function ChatDemoPage() {
  const [username, setUsername] = useState("")
  const [joined, setJoined] = useState(false)

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Live Chat Demo</h1>

      {!joined ? (
        <div className="space-y-4">
          <input
            className="border p-2 w-full rounded"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={() => setJoined(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={!username.trim()}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <ChatBox username={username} roomId="demo-room" />
      )}
    </div>
  )
}
