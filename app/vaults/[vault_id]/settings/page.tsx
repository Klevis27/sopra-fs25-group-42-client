"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Typography,
  message,
  Table,
  App,
} from "antd";
import { useApi } from "@/hooks/useApi";

const { Title } = Typography;

type Vault = {
  id: string;
  name: string;
  state: string;
};

type User = {
  id: number;
  username: string;
};

type VaultPermission = {
  userId: number;
  username: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
};

const VaultSettings: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vaultId = params.vault_id as string;
  const [form] = Form.useForm();
  const [vault, setVault] = useState<Vault | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<VaultPermission[]>([]);
  const [permForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const apiService = useApi();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    apiService.get<Vault>(`/vaults/${vaultId}`, token)
      .then((data) => {
        setVault(data);
        form.setFieldsValue({
          name: data.name,
          state: data.state || "Private",
        });
      })
      .catch(() => {
        messageApi.error("Vault not found.");
        router.push("/vaults");
      });
  }, [vaultId, router, form, messageApi]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    apiService.get<User[]>(`/users`, token)
      .then((data) => setUsers(data))
      .catch(() => messageApi.error("Failed to load users"));

    apiService.get<VaultPermission[]>(`/vaults/${vaultId}/settings/permissions`, token)
      .then((data) => setPermissions(data))
      .catch(() => messageApi.error("Failed to load permissions"));
  }, [vaultId, messageApi]);

  const handleSave = async (values: { name: string; state: string }) => {
    if (!vault) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      messageApi.error("Unauthorized");
      return;
    }

    try {
      await apiService.put(`/vaults/${vaultId}`, values, token);
      messageApi.success("Vault updated successfully!");
      router.replace("/vaults");
    } catch (error: any) {
      if (error.status === 403) {
        messageApi.error("Only the owner can update the vault.");
      } else {
        messageApi.error(error?.message || "Update failed");
      }
    }
  };

  const handleAddPermission = async (values: { userId: number; role: string }) => {
    if (values.role === "OWNER") {
      messageApi.error("Cannot assign OWNER role manually.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const updated = await apiService.post<VaultPermission[]>(
        `/vaults/${vaultId}/settings/permissions`,
        values,
        token
      );
      messageApi.success("Permission added.");
      permForm.resetFields();
      setPermissions(updated);
    } catch {
      messageApi.error("Could not add permission.");
    }
  };

  const handleDeleteVault = async () => {
    if (!vault) return;

    const confirmed = window.confirm("Are you sure you want to delete this vault?");
    if (!confirmed) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await apiService.delete(`/vaults/${vaultId}/settings/delete`, token);
      messageApi.success("Vault deleted.");
      router.push("/vaults");
    } catch (error: any) {
      if (error.status === 403) {
        messageApi.error("Only the owner can delete this vault.");
      } else {
        messageApi.error(error?.message || "Could not delete vault.");
      }
    }
  };

  return (
    <App>
      {contextHolder}
      <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
        <Card loading={!vault}>
          <Title level={3}>Edit Vault</Title>
          {vault && (
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                name="name"
                label="Vault Name"
                rules={[{ required: true, message: "Please enter a vault name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="state"
                label="Visibility"
                rules={[{ required: true, message: "Please select a visibility" }]}
              >
                <Select>
                  <Select.Option value="Private">Private</Select.Option>
                  <Select.Option value="Shared">Shared</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Save Changes
                </Button>
              </Form.Item>

              <Form.Item>
                <Button block onClick={() => router.push("/vaults")} danger>
                  Cancel
                </Button>
              </Form.Item>

              <Form.Item>
                <Button danger type="default" block onClick={handleDeleteVault}>
                  Delete Vault
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>

        <Card style={{ marginTop: "2rem" }} title="Permissions">
          <Form layout="inline" form={permForm} onFinish={handleAddPermission}>
            <Form.Item
              name="userId"
              rules={[{ required: true, message: "Select a user" }]}
            >
              <Select placeholder="Select user" style={{ width: 200 }}>
                {users
                  .filter((user) => !permissions.some((p) => p.userId === user.id))
                  .map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.username}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="role"
              rules={[{ required: true, message: "Select role" }]}
            >
              <Select placeholder="Select role" style={{ width: 150 }}>
                <Select.Option value="EDITOR">Editor</Select.Option>
                <Select.Option value="VIEWER">Viewer</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Add
              </Button>
            </Form.Item>
          </Form>

          <Table
            style={{ marginTop: "1rem" }}
            dataSource={permissions}
            rowKey="userId"
            pagination={false}
            columns={[
              { title: "Username", dataIndex: "username" },
              { title: "Role", dataIndex: "role" },
            ]}
          />
        </Card>
      </div>
    </App>
  );
};

export default VaultSettings;