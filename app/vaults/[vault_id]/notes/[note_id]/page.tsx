"use client";

import {Button} from "antd";
import {useEffect, useState} from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import Sidebar from "@/components/Sidebar";
import {Note} from "@/types/note";
import {useApi} from "@/hooks/useApi";
import NoteGraph from "@/components/NoteGraph";
import ChatBox from "@/components/ChatBox";
import {useParams, useRouter} from "next/navigation";

export default function Editor() {
    //const [showSettings, setShowSettings] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNoteTitle, setCurrentNoteTitle] = useState<string>("ACTIVE NOTE");

    const apiService = useApi(); // Make sure this hook is working

    const router = useRouter();
    const params = useParams();
    const noteId = params.note_id as string;
    //const vaultId = params.vault_id as string;
    const [cameFromShared, setCameFromShared] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setCameFromShared(params.get("from") === "shared");
        }
    }, []);

    const vaultId = params.vault_id as string;


    const redirectToNote = (id: string | null) => {
        if (!id) return;
        const query = cameFromShared ? "?from=shared" : "";
        router.push(`/vaults/${vaultId}/notes/${id}${query}`);
    };


    useEffect(() => {
        const getCurrentNoteName = async () => {
            try {
                const response = await apiService.get<Note>(`/notes/${noteId}`);
                if (response.title) {
                    setCurrentNoteTitle(response.title);
                }
            } catch (error) {
                console.error("Failed to fetch notes:", error);
            }
        }
        getCurrentNoteName();
    }, [apiService, noteId]);


    useEffect(() => {
        if (cameFromShared) return; // 🚫 don't fetch notes by vault

        const getAllNotes = async () => {
            try {
                const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`);
                setNotes(response);
            } catch (error) {
                console.error("Failed to fetch notes:", error);
            }
        };

        getAllNotes();
    }, [apiService, vaultId, cameFromShared]);




    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            {/* Header */}
            <header style={{
                background: "#f8f9fa",
                padding: "16px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <div>
                    <span style={{fontSize: "1.25rem", fontWeight: "bold", color: "black"}}>YOUR VAULT</span>
                    <a
                        href={cameFromShared ? "/shared-notes" : `/vaults/${vaultId}/notes`}
                        className={"ml-3"}
                    >
                        Back to Notes
                    </a>

                </div>
            </header>

            {/* Main Layout */}
            <div style={{display: "flex", flex: 1, overflow: "hidden", font: "black"}}>
                {/* Left Sidebar */}
                {isLeftSidebarOpen && (
                    <Sidebar isOpen={isLeftSidebarOpen} onClose={() => setIsLeftSidebarOpen(false)} position="left">
                        <h2>Notes</h2>

                        {/* ✅ Only show note list if NOT coming from shared notes */}
                        {!cameFromShared ? (
                            <>
                                <ul>
                                    {notes.map((note, index) => (
                                        <li
                                            key={index}
                                            onClick={() => redirectToNote(note.id)}
                                            style={{
                                                cursor: "pointer",
                                                padding: "4px 0",
                                                color: note.title === currentNoteTitle ? "#007bff" : "black",
                                                fontWeight: note.title === currentNoteTitle ? "bold" : "normal",
                                            }}
                                        >
                                            - {note.title}
                                        </li>
                                    ))}
                                </ul>
                                <p style={{fontSize: "0.75rem", color: "#888", marginTop: "16px"}}>Status: [TBA]</p>
                            </>
                        ) : (
                            <p style={{fontSize: "0.875rem", color: "#666"}}>This is a shared note. Vault notes are not visible.</p>
                        )}
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
                        marginLeft: isLeftSidebarOpen ? "310px" : "0px",
                        marginRight: isRightSidebarOpen ? "310px" : "0px",
                    }}
                    className={"overflow-auto"}
                >
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        textAlign: "center",
                        marginBottom: "16px",
                        color: "black"
                    }}>
                        {currentNoteTitle}
                    </h1>
                    <div style={{height: "90%", fontSize: "1.5rem", color: "black"}}>
                        <MarkdownEditor/>
                    </div>
                </main>

                {/* Right Sidebar */}
                {isRightSidebarOpen && (
                    <Sidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} position="right">
                        <div style={{
                            width: "300px",
                            height: "300px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            background: "#e9ecef",
                            position: "relative",  // Important for child absolute positioning
                            overflow: "hidden"     // Prevent any overflow
                        }}>
                            <NoteGraph/>
                        </div>
                        <div style={{textAlign: "center", padding: "16px"}}>
                            <Button
                                type="primary"
                                onClick={() => router.push(`/vaults/${vaultId}/notes/${noteId}/settings${cameFromShared ? "?from=shared" : ""}`)}
                            >
                                Settings
                            </Button>
                        </div>

                        {/* ✅ Add ChatBox here */}
                        <div style={{marginTop: "24px", overflow: "hidden"}}>
                            <ChatBox roomId={noteId}/>
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