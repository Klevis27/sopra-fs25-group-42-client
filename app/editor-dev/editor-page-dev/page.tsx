"use client";

import { Button } from "antd";
import { useState } from "react";
import Image from "next/image";
import MarkdownEditor from "../../editor-dev/components/MarkdownEditor";
import Sidebar from "@/editor-dev/components/Sidebar";

export default function Home() {
    const [showSettings, setShowSettings] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Header */}
            <header style={{ background: "#f8f9fa", padding: "16px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "black" }}>YOUR VAULT</span>
                <button style={{ padding: "8px 12px", background: "#007bff", color: "white", borderRadius: "4px", border: "none" }}>Extract as PDF</button>
            </header>

            {/* Main Layout */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Left Sidebar */}
                {isLeftSidebarOpen && (
                    <Sidebar isOpen={isLeftSidebarOpen} onClose={() => setIsLeftSidebarOpen(false)} position="left">
                        <h2>Project Navigator</h2>
                        <ul>
                            <li>▶ Main</li>
                            <li>▶ Topic2</li>
                            <li>▶ Topic3</li>
                            <li>▶ Topic4</li>
                        </ul>
                        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "16px" }}>Status: Read Only</p>
                    </Sidebar>
                )}

                {/* Main Content - Markdown Editor */}
                <main
                    style={{
                        flex: "1",
                        padding: "24px",
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
                        height: "90vh",
                        transition: "margin 0.3s ease-in-out",
                        marginLeft: isLeftSidebarOpen ? "290px" : "0px",
                        marginRight: isRightSidebarOpen ? "290px" : "0px",
                    }}
                >
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", marginBottom: "16px", color: "black" }}>
                        ACTIVE NOTE
                    </h1>
                    <div style={{height:"90%", fontSize: "1.5rem", color: "black" }}>
                        <MarkdownEditor/>
                    </div>
                </main>

                {/* Right Sidebar */}
                {isRightSidebarOpen && (
                    <Sidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} position="right">
                        <div style={{ width: "100%", height: "300px", border: "1px solid #ddd", borderRadius: "8px", background: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src="/graph-mock.png" alt="Graph View" width={250} height={200} />
                        </div>
                        <div style={{ textAlign: "center", padding: "16px" }}>
                            <Button type="primary" onClick={() => setShowSettings(!showSettings)}>Settings</Button>
                            {showSettings && (
                                <div style={{ marginTop: "10px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#f8f9fa" }}>
                                    <p>Settings Panel (Placeholder)</p>
                                </div>
                            )}
                        </div>
                    </Sidebar>
                )}
            </div>

            {/* Sidebar Toggle Buttons */}
            <button
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                style={{
                    position: "absolute",
                    left: isLeftSidebarOpen ? "260px" : "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "left 0.3s ease-in-out",
                }}
            >
                {isLeftSidebarOpen ? "Close" : "☰"}
            </button>

            <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                style={{
                    position: "absolute",
                    right: isRightSidebarOpen ? "260px" : "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "right 0.3s ease-in-out",
                }}
            >
                {isRightSidebarOpen ? "Close" : "☰"}
            </button>
        </div>
    );
}
