"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";

const { Title } = Typography;
const BASE_URL = "http://localhost:8080";

type Vault = {
  id: number;
  name: string;
};

const Vaults: React.FC = () => {
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [newVaultName, setNewVaultName] = useState("");

  const fetchVaults = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/vaults`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch vaults");

      const data = await res.json();
      setVaults(data);
    } catch {
      message.error("Failed to load vaults.");
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  const handleContinue = async () => {
    if (!newVaultName.trim()) {
      message.warning("Please enter a vault name.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/vaults`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newVaultName.trim(),
          state: "Private",
        }),
      });

      if (res.ok) {
        message.success("Vault created!");
        setNewVaultName("");
        fetchVaults();
      } else {
        const err = await res.json();
        message.error(err?.Error || "Could not create vault.");
      }
    } catch {
      message.error("Could not create vault.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      <Card style={{ flex: 1 }}>
        <Title level={3}>My Vaults</Title>
        <List
          bordered
          dataSource={vaults}
          renderItem={(vault) => (
            <List.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 500 }}>{vault.name}</span>
                <Space>
                  <Button
                    size="small"
                    onClick={() => router.push(`/vaults/${vault.id}/notes`)}
                  >
                    Notes
                  </Button>
                  <Button
                    size="small"
                    onClick={() => router.push(`/vaults/${vault.id}/settings`)}
                  >
                    Settings
                  </Button>
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
          <Button type="primary" block onClick={handleContinue}>
            Continue
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Vaults;