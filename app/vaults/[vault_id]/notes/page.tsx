"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, Card, Input, Typography, List, Space, message} from "antd";
import {useApi} from "@/hooks/useApi";
import {Note} from "@/types/note";

const {Title} = Typography;

const Notes: React.FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [vaultName, setVaultName] = useState("");
  const [newNoteName, setNewNoteName] = useState("");
  const apiService = useApi();
  const params = useParams();
  const vaultId = params.vault_id as string;

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
          router.push("/login");
          return;
        }

        // GET Vault Name
        const vaultInfo = await apiService.get<{ name: string }>(`/vaults/${vaultId}/name`, accessToken);
        setVaultName(vaultInfo.name);

        // GET Notes
        const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`, accessToken);

        // If no such user exists
        if (response == null) {
          console.error("No response returned");
          alert("No response returned");
          return
        }

        // Set Notes
        setNotes(response)
      } catch (error) {
        // @ts-expect-error - No proper interface
        if (error.status == 404) {
          console.error("Could not find notes!");
          alert("Notes not found.");
        }
        // @ts-expect-error - No proper interface
        console.error("Error", error.status);
        alert("Unknown error occurred.");
      }
    };
    fetchNotes();
  }, [apiService, router, vaultId]);

  // commented out for future use
  // const handleLogout = () => {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("id");
  //   clearLoginCookie();
  //   router.push("/login");
  // };

  const handleContinueToNoteCreation = () => {
    if (!newNoteName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }
    const encodedName = encodeURIComponent(newNoteName.trim());
    router.push(`/vaults/${vaultId}/notes/create?name=${encodedName}`);
  };

  return (
      <div className="m-12">
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
