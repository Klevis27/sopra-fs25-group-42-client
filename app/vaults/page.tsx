"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Vault } from "@/types/vault";
import { useApi } from "@/hooks/useApi";

const { Title } = Typography;

const Vaults: React.FC = () => {
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [newVaultName, setNewVaultName] = useState("");
  const apiService = useApi();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
          router.push("/login");
          return;
        }

        const response = await apiService.get<Vault[]>(`/vaults`, accessToken);
        if (!response) {
          alert("No such vaults exist!");
          return;
        }
        setVaults(response);
      } catch (error: any) {
        if (error?.status === 404) {
          alert("Vaults not found.");
        } else {
          alert("Unknown error occurred.");
        }
      }
    };
    fetchNotes();
  }, [apiService, router]);

  const handleContinueToCreation = () => {
    if (!newVaultName.trim()) {
      message.warning("Please enter a vault name.");
      return;
    }
    router.push(`/vaults/create?name=${encodeURIComponent(newVaultName.trim())}`);
  };

  return (
    <div className="m-12">
      <div className="flex justify-end mb-6">
        <Button
          icon={<UserOutlined />}
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
      </div>

      <div className="flex flex-wrap gap-[2rem] p-[2rem]">
        <Card style={{ flex: 1 }}>
          <Title level={3}>My Vaults</Title>
          <List
            bordered
            dataSource={vaults}
            renderItem={(vault) => (
              <List.Item>
                <div className="flex justify-between w-full items-center">
                  <span className="font-medium">{vault.name}</span>
                  <Space>
                    <Button size="small" onClick={() => router.push(`/vaults/${vault.id}/notes`)}>Notes</Button>
                    <Button size="small" onClick={() => router.push(`/vaults/${vault.id}/settings`)}>Settings</Button>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card style={{ width: 300 }}>
          <Title level={4}>Create New Vault</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Vault Name"
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
            />
            <Button type="primary" block onClick={handleContinueToCreation}>
              Continue
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Vaults;