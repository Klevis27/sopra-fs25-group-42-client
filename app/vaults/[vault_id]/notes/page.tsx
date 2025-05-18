"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, Card, Input, Typography, List, Space, message} from "antd";
import {useApi} from "@/hooks/useApi";
import {Note} from "@/types/note";
import {ArrowLeftOutlined} from "@ant-design/icons";

import {
    UserOutlined,
    LogoutOutlined,
} from "@ant-design/icons";

const {Title} = Typography;

const Notes: React.FC = () => {
    const router = useRouter();
    const params = useParams<{ [key: string]: string }>(); // ✅ fixed
    const vaultId = params.vault_id;

    const [notes, setNotes] = useState<Note[]>([]);
    const [vaultName, setVaultName] = useState("");
    const [newNoteName, setNewNoteName] = useState("");
    const apiService = useApi();

    /* ── lock the page to viewport ─────────────────────────── */
    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        const originalOverflow = document.body.style.overflow;
        document.body.style.backgroundColor = "#faf2b2";
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.backgroundColor = originalBg;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    /* ── fetch data ─────────────────────────────────────────── */
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const id = localStorage.getItem("id");
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken || !id) {
                    router.push("/login");
                    return;
                }

                // 1. vault name
                const vaultInfo = await apiService.get<{ name: string }>(
                    `/vaults/${vaultId}/name`,
                    accessToken
                );
                setVaultName(vaultInfo.name);

                // 2. notes
                const response = await apiService.get<Note[]>(
                    `/vaults/${vaultId}/notes`,
                    accessToken
                );
                setNotes(response ?? []);
            } catch (err: unknown) {
                const status = (err as { status?: number })?.status;
                message.error(status === 404 ? "Notes not found." : "Unknown error occurred.");
            }
        };

        if (vaultId) fetchNotes();
    }, [apiService, router, vaultId]);

    const handleCreateNote = async () => {
        if (!newNoteName.trim()) {
            message.warning("Please enter a note name.");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        const creatorId = localStorage.getItem("id");

        if (!accessToken || !creatorId) {
            message.error("You must be logged in to create a note.");
            router.push("/login");
            return;
        }

        try {
            const newNote = await apiService.post<{ message : string, note : Note }>(
                `/vaults/${vaultId}/notes`,
                {
                    title: newNoteName.trim(),
                    creatorId,
                },
                accessToken
            );

            // Option 1: Redirect directly to the editor
            router.push(`/vaults/${vaultId}/notes/${newNote.note.id}`);

            // Option 2 (alternate): Just show it in the list
            // setNotes((prev) => [...prev, newNote]);

            setNewNoteName("");
        } catch (error) {
            if (error instanceof Error) {
                message.error(`Failed to create note: ${error.message}`);
            } else {
                console.error("Unknown error during note creation:", error);
            }
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("id");
        localStorage.removeItem("username");
        message.success("You have been logged out.");
        router.push("/");
    };


    return (
        <div className="m-12">
            <div className="flex justify-end gap-4 mb-6">
                <Button
                    icon={<UserOutlined/>}
                    onClick={() => {
                        const id = localStorage.getItem("id");
                        if (id) {
                            router.push(`/profile/${id}`);
                        } else {
                            message.error("User ID not found. Please login again.");
                        }
                    }}
                >
                    Profile
                </Button>

                <Button icon={<LogoutOutlined/>} danger onClick={handleLogout}>
                    Logout
                </Button>
            </div>
            <Button
                icon={<ArrowLeftOutlined/>}
                onClick={() => router.push("/vaults")}
                style={{marginBottom: "1rem"}}
            >
                Back to Vaults
            </Button>

            <div className={"flex flex-wrap gap-[2rem] p-[2rem]"}>
                {/* Left Column: Note List */}
                <Card style={{flex: 1}}>
                    <Title level={3}>Vault: {vaultName}</Title>
                    <List
                        bordered
                        dataSource={notes}
                        renderItem={(note) => (
                            <List.Item>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        alignItems: "center",
                                    }}
                                >
                                    <span style={{fontWeight: 500}}>{note.title}</span>
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => router.push(`/vaults/${vaultId}/notes/${note.id}`)}
                                        >
                                            Editor
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => router.push(`/vaults/${vaultId}/notes/${note.id}/settings`)}
                                        >
                                            Settings
                                        </Button>
                                    </Space>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                {/* Right Column: Create Note */}
                <Card style={{width: 300}}>
                    <Title level={4}>Create New Note</Title>
                    <Space direction="vertical" style={{width: "100%"}}>
                        <Input
                            placeholder="Note Name"
                            value={newNoteName}
                            onChange={(e) => setNewNoteName(e.target.value)}
                        />
                        <Button type="primary" block onClick={handleCreateNote}>
                            Create Note
                        </Button>

                    </Space>
                </Card>
            </div>
        </div>
    )
        ;
};

export default Notes;