"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Typography,
  List,
  Space,
  message,
  Tag,
} from "antd";
import {
  UserOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Vault } from "@/types/vault";
import { useApi } from "@/hooks/useApi";

const { Title } = Typography;

const Vaults: React.FC = () => {
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [newVaultName, setNewVaultName] = useState("");
  const apiService = useApi();

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
          router.push("/login");
          return;
        }

        const response = await apiService.get<Vault[]>(`/vaults`, accessToken);
        if (!response) {
          alert("No vaults available!");
          return;
        }
        setVaults(response);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong:\n${error.message}`);
        } else {
          console.error("An unknown error occurred.");
        }
      }
    };
    fetchVaults();
  }, [apiService, router]);

  const handleContinueToCreation = () => {
    if (!newVaultName.trim()) {
      message.warning("Please enter a vault name.");
      return;
    }
    router.push(`/vaults/create?name=${encodeURIComponent(newVaultName.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    message.success("You have been logged out.");
    router.push("/");
  };

  const myVaults = vaults.filter((v) => v.role === "OWNER");
  const sharedVaults = vaults.filter((v) => v.role !== "OWNER");

  return (
    <div className="m-12">
      <div className="flex justify-end gap-4 mb-6">
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

        <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="flex flex-wrap gap-[2rem] p-[2rem]">
        <Card style={{ flex: 1 }}>
          {myVaults.length > 0 && (
            <>
              <Title level={3}>My Vaults</Title>
              <List
                bordered
                dataSource={myVaults}
                renderItem={(vault) => (
                  <List.Item>
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-2">
                        <FolderOpenOutlined style={{ color: "#1677ff" }} />
                        <span className="font-semibold text-base">{vault.name}</span>
                        <Tag color="geekblue">Vault ID: {vault.id}</Tag>
                      </div>
                      <Space>
                        <Button size="small" onClick={() => router.push(`/vaults/${vault.id}/notes`)}>
                          Notes
                        </Button>
                        <Button size="small" onClick={() => router.push(`/vaults/${vault.id}/settings`)}>
                          Settings
                        </Button>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </>
          )}

          {sharedVaults.length > 0 && (
            <>
              <Title level={3} style={{ marginTop: "2rem" }}>
                Shared Vaults
              </Title>
              <List
                bordered
                dataSource={sharedVaults}
                renderItem={(vault) => (
                  <List.Item>
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-2">
                        <FolderOpenOutlined style={{ color: "#52c41a" }} />
                        <span className="font-semibold text-base">{vault.name}</span>
                        <Tag color="purple">Vault ID: {vault.id}</Tag>
                        <Tag color="orange">{vault.role}</Tag>
                      </div>
                      <Space>
                        <Button size="small" onClick={() => router.push(`/vaults/${vault.id}/notes`)}>
                          Notes
                        </Button>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
                  <div className="mt-6 pl-2">
      <Button type="default" onClick={() => router.push("/shared-notes")}>
      ← View All Shared Notes
      </Button>  </div>
            </>
          )}
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
