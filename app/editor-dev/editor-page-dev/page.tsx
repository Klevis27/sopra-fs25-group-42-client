"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
    const router = useRouter();
    const [noteContent, setNoteContent] = useState("");
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Header */}
            <header style={{ background: "#f8f9fa", padding: "16px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: "bold", color:"black"}}>Markdown Editor</span>
                <button style={{ padding: "8px 12px", background: "#007bff", color: "white", borderRadius: "4px", border: "none" }}>Extract as PDF</button>
            </header>

            <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "16px", gap: "16px" }}>
                {/* Sidebar */}
                <aside style={{ width: "20%", borderRight: "1px solid #ddd", background: "#f1f3f5", padding: "16px", color:"black" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}>Project 42</h2>
                    <ul>
                        <li style={{ marginLeft: "16px", color:"black" }}>▶ Main</li>
                        <li style={{ marginLeft: "32px", color:"black" }}>▶ Topic2</li>
                        <li style={{ marginLeft: "32px", color:"black" }}>▶ Topic3</li>
                        <li style={{ marginLeft: "32px", color:"black" }}>▶ Topic4</li>
                    </ul>
                    <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "16px" }}>Status: Read Only</p>
                </aside>

                {/* Main Content - Markdown Editor */}
                <main style={{ width: "80%", padding: "24px", background: "white", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "16px", color:"black" }}>Markdown Editor</h1>
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        style={{ width: "100%", height: "90%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", fontFamily: "monospace", resize: "none" }}
                        placeholder="Start writing your markdown..."
                    />
                </main>

                {/* Right Panel */}
                <aside style={{ width: "40%", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Graph View (Mock Image) */}
                    <div style={{ width: "100%", height: "300px", border: "1px solid #ddd", borderRadius: "8px", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Image src="/graph-mock.png" alt="Graph View" width={250} height={200} />
                    </div>

                    {/* Settings Button */}
                    <div style={{ textAlign: "center", padding: "16px" }}>
                        <Button type="primary" onClick={() => setShowSettings(!showSettings)}>Settings</Button>
                        {showSettings && (
                            <div style={{ marginTop: "10px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#f8f9fa" }}>
                                <p>Settings Panel (Placeholder)</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
