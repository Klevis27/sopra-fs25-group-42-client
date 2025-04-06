"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";

const { Title } = Typography;

type Note = {
  id: string;
  name: string;
  state: string;
};

const Notes: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const vaultIdRaw = params?.vault_id;
  const vaultId = typeof vaultIdRaw === "string"
    ? vaultIdRaw
    : Array.isArray(vaultIdRaw)
    ? vaultIdRaw[0]
    : null;

  if (!vaultId) {
    throw new Error("Vault ID is missing or invalid.");
  }

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("notes");
    const notesData: Record<string, Note[]> = raw ? JSON.parse(raw) : {};
    const vaultNotes = notesData[vaultId] || [];
    setNotes(vaultNotes);
  }, [vaultId]);

  const handleContinue = () => {
    if (!newNoteName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      name: newNoteName.trim(),
      state: "Private",
    };

    const updatedVaultNotes = [...notes, newNote];
    const raw = localStorage.getItem("notes");
    const notesData: Record<string, Note[]> = raw ? JSON.parse(raw) : {};
    notesData[vaultId] = updatedVaultNotes;

    localStorage.setItem("notes", JSON.stringify(notesData));
    setNotes(updatedVaultNotes);
    setNewNoteName("");
  };

  const handleRemoveNote = (id: string) => {
    const updatedVaultNotes = notes.filter((note) => note.id !== id);
    const raw = localStorage.getItem("notes");
    const notesData: Record<string, Note[]> = raw ? JSON.parse(raw) : {};
    notesData[vaultId] = updatedVaultNotes;

    localStorage.setItem("notes", JSON.stringify(notesData));
    setNotes(updatedVaultNotes);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "2rem" }}>
      <Button onClick={() => router.push("/vaults")} style={{ width: "fit-content" }}>
        ← Back to Vaults
      </Button>

      <div style={{ display: "flex", gap: "2rem" }}>
        <Card style={{ flex: 1 }}>
          <Title level={3}>My Notes</Title>
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
                  <span style={{ fontWeight: 500 }}>{note.name}</span>
                  <Space>
                    <Button size="small">Go to Editor Page</Button>
                    <Button size="small" danger onClick={() => handleRemoveNote(note.id)}>
                      Delete
                    </Button>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card style={{ width: 300 }}>
          <Title level={4}>Create New Notes</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="New Note Name"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
            />
            <Button type="primary" block onClick={handleContinue}>
              Continue
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Notes;