"use client";
import "@ant-design/v5-patch-for-react-19";
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
    fetch("http://localhost:8080/vaults")
      .then((res) => res.json())
      .then((data) => setVaults(data))
      .catch((err) => {
        console.error("Vault fetch error:", err);
        message.error("Could not load vaults.");
      });
  }, []);

  const handleContinue = () => {
    if (!newVaultName.trim()) {
      message.warning("Please enter a note name.");
      return;
    }

    const payload = {
      name: newVaultName.trim(),
    };

    fetch("http://localhost:8080/vaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newVault: Vault) => {
        setVaults([...vaults, newVault]);
        setNewVaultName("");
        router.push(`/vaults/${newVault.id}/notes`);
      })
      .catch((err) => {
        console.error("Vault creation error:", err);
        message.error("Could not create vault.");
      });
  };

  const handleRemoveVault = (id: string) => {
    fetch(`http://localhost:8080/vaults/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        const updatedVaults = vaults.filter((vault) => vault.id !== id);
        setVaults(updatedVaults);
      })
      .catch((err) => {
        console.error("Vault delete error:", err);
        message.error("Could not delete vault.");
      });
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