"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";

const { Title } = Typography;

type Note = {
  id: string;
  name: string;
  state: string;
};

const Vaults: React.FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteName, setNewNoteName] = useState("");

  // 1. Sayfa açıldığında notları API'den çekiyoruz.
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes", { method: "GET" });
        if (!res.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data: Note[] = await res.json();
        setNotes(data);
      } catch (error: any) {
        console.error(error);
        message.error("Could not load notes.");
      }
    };

    fetchNotes();
  }, []);

  // 2. Yeni not eklemek için API'ye POST isteği atıyoruz.
  const handleContinue = async () => {
    if (!newNoteName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newNoteName.trim(),
          state: "Private", // state gibi ek alanlar da gönderebilirsiniz
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create note");
      }

      // Backend'den dönen yeni not bilgisini al
      const createdNote: Note = await res.json();

      // State'i güncelle (listeyi yeniden oluştur)
      setNotes((prev) => [...prev, createdNote]);

      // Input temizle
      setNewNoteName("");

      // Dilersen user’ı başka sayfaya yönlendirebilirsin
      router.push(`/vaults/create?name=${encodeURIComponent(createdNote.name)}`);
    } catch (error: any) {
      console.error(error);
      message.error("Failed to create note. Please try again.");
    }
  };

  // 3. Notu silmek için API'ye DELETE isteği atıyoruz.
  const handleRemoveNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete note");
      }

      // Silinen not başarıyla kaldırıldıysa, frontend’de de listeden çıkaralım
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error: any) {
      console.error(error);
      message.error("Could not delete the note. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* Left Column: Notes List */}
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
                  <Button
                    size="small"
                    onClick={() => router.push(`/vaults/${note.id}/notes`)}
                  >
                    Go to Editor Page
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => handleRemoveNote(note.id)}
                  >
                    Delete
                  </Button>
                </Space>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Right Column: Create Notes */}
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