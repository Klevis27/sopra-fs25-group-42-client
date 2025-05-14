"use client";

import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { Note } from "@/types/note";
import MovingLetters from "@/components/MovingLetters";

const { Title } = Typography;

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

  /* ── navigation helpers ────────────────────────────────── */
  const handleContinueToNoteCreation = () => {
    if (!newNoteName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }
    const encodedName = encodeURIComponent(newNoteName.trim());
    router.push(`/vaults/${vaultId}/notes/create?name=${encodedName}`);
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="m-12 relative min-h-screen overflow-hidden">
      <MovingLetters />

      <div className="flex flex-wrap gap-[2rem] p-[2rem]">
        {/* vault card */}
        <Card style={{ flex: 1, alignSelf: "flex-start" }}>
          <Title level={3}>Vault: {vaultName}</Title>
          <List
            bordered
            dataSource={notes}
            locale={{ emptyText: "No notes yet." }}
            style={{ maxHeight: 400, overflowY: "auto" }}
            renderItem={(note) => (
              <List.Item>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{note.title}</span>
                  <Space>
                    <Button
                      size="small"
                      onClick={() => router.push(`/vaults/${vaultId}/notes/${note.id}`)}
                    >
                      Editor
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        router.push(`/vaults/${vaultId}/notes/${note.id}/settings`)
                      }
                    >
                      Settings
                    </Button>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* create‑note card */}
        <Card style={{ width: 300, alignSelf: "flex-start" }}>
          <Title level={4}>Create New Note</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Note Name"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
            />
            <Button type="primary" block onClick={handleContinueToNoteCreation}>
              Continue
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Notes;