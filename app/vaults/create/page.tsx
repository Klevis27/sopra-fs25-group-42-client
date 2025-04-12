"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";

const { Title } = Typography;

type Note = {
  id: string;
  name: string;
  state: "Private" | "Public" | string; // daha sonra enum ile iyileştirilebilir
};

const Vaults: React.FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data: Note[] = await res.json();
      setNotes(data);
    } catch (error) {
      console.error(error);
      message.error("Could not load notes.");
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleContinue = async () => {
    if (!newNoteName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newNoteName.trim(), state: "Private" }),
      });

      if (!res.ok) throw new Error("Failed to create note");

      const createdNote: Note = await res.json();
      setNotes((prev) => [...prev, createdNote]);
      setNewNoteName("");
      message.success("Note created successfully.");
      router.push(`/vaults/${createdNote.id}/notes`);
    } catch (error) {
      console.error(error);
      message.error("Failed to create note. Please try again.");
    }
  };

  const handleRemoveNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((note) => note.id !== id));
      message.success("Note deleted.");
    } catch (error) {
      console.error(error);
      message.error("Could not delete the note. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* Notes List */}
      <Card style={{ flex: 1 }}>
        <Title level={3}>My Notes</Title>
        <List
          bordered
          dataSource={notes}
          renderItem={(note) => (
            <List.Item>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>{note.name}</span>
                <Space>
                  <Button size="small" onClick={() => router.push(`/vaults/${note.id}/notes`)}>
                    Go to Editor Page
                  </Button>
                  <Button size="small" danger onClick={() => handleRemoveNote(note.id)}>
                    Delete
                  </Button>
                </Space>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* New Note Creator */}
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
  );
};

export default Vaults;