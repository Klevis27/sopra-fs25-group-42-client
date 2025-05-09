"use client";
import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Typography,
  List,
  message,
  Tag,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";

const { Title } = Typography;

interface SharedNote {
  id: number;
  title: string;
  vaultId: number;
}

const SharedNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const apiService = useApi();
  const router = useRouter();

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await apiService.get<SharedNote[]>("/notes/shared", token);
        if (!response) {
          message.info("No shared notes found.");
          return;
        }

        setNotes(response);
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch shared notes.");
      }
    };

    fetchSharedNotes();
  }, [apiService, router]);

  return (
    <div className="m-12">
      <Card>
        <Title level={3}>Shared Notes</Title>
        {notes.length === 0 ? (
          <p>No shared notes available.</p>
        ) : (
          <List
            bordered
            dataSource={notes}
            renderItem={(note) => (
              <List.Item>
                <div className="flex justify-between w-full items-center">
                  <div className="flex items-center gap-2">
                    <FileTextOutlined style={{ color: "#fa8c16" }} />
                    <span className="font-semibold text-base">{note.title}</span>
                    <Tag color="gold">Vault ID: {note.vaultId}</Tag>
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      router.push(`/vaults/${note.vaultId}/notes/${note.id}`)
                    }
                  >
                    Open
                  </Button>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default SharedNotesPage;
