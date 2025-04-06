"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Typography, List, Space, message } from "antd";

const { Title } = Typography;

type Vault = {
  id: string;
  name: string;
  state: string;
};

const Vaults: React.FC = () => {
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [newVaultName, setNewVaultName] = useState("");

  useEffect(() => {
    const initialVaults: Vault[] = [
      { id: "1", name: "Project 42", state: "Private" },
      { id: "2", name: "SoPro Project", state: "Shared" },
      { id: "3", name: "sopra-fs25-group-42", state: "Private" },
    ];

    const existing = JSON.parse(localStorage.getItem("vaults") || "[]");

    if (!existing.length) {
      localStorage.setItem("vaults", JSON.stringify(initialVaults));
      setVaults(initialVaults);
    } else {
      setVaults(existing);
    }
  }, []);

  const handleContinue = () => {
    if (!newVaultName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }

    const encodedName = newVaultName.trim();
    const newVault: Vault = {
      id: Date.now().toString(), // benzersiz id
      name: encodedName,
      state: "Private", // varsayılan
    };

    const updatedVaults = [...vaults, newVault];
    localStorage.setItem("vaults", JSON.stringify(updatedVaults));
    setVaults(updatedVaults);
    setNewVaultName(""); // inputu sıfırla

    router.push(`/vaults/${newVault.id}/notes`);
  };

  const handleRemoveVault = (id: string) => {
    const updatedVaults = vaults.filter((vault) => vault.id !== id);
    setVaults(updatedVaults);
    localStorage.setItem("vaults", JSON.stringify(updatedVaults));
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* Left Column: Vault List */}
      <Card style={{ flex: 1 }}>
        <Title level={3}>My Notes</Title>
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
                    Go to Editor Page
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => handleRemoveVault(vault.id)}
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