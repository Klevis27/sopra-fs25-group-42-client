"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
  Table,
  App,
  Select,
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
        form.setFieldsValue({ name: data.name });
      })
      .catch(() => {
        messageApi.error("Vault not found.");
        router.push("/vaults");
      });
  }, [vaultId, router, form, messageApi, apiService]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    apiService.get<User[]>(`/users`, token)
      .then(setUsers)
      .catch(() => messageApi.error("Failed to load users"));

    apiService
      .get<VaultPermission[]>(`/vaults/${vaultId}/settings/permissions`, token)
      .then(setPermissions)
      .catch(() => messageApi.error("Failed to load permissions"));
  }, [vaultId, messageApi, apiService]);

  const handleSave = async (values: { name: string }) => {
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
    } catch (error) {
      if (error instanceof Error) alert(`Update failed:\n${error.message}`);
      else console.error("Unknown error.");
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
    if (!globalThis.confirm("Are you sure you want to delete this vault?")) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await apiService.delete(`/vaults/${vaultId}/settings/delete`, token);
      messageApi.success("Vault deleted.");
      router.push("/vaults");
    } catch (error) {
      if (error instanceof Error) alert(`Delete failed:\n${error.message}`);
      else console.error("Unknown error.");
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

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Save Changes
                </Button>
              </Form.Item>

              <Form.Item>
                <Button danger block onClick={handleDeleteVault}>
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
              <Select
                showSearch
                placeholder="Select user"
                style={{ width: 200 }}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const child = option?.children as unknown;
                  return (
                    typeof child === "string" &&
                    child.toLowerCase().includes(input.toLowerCase())
                  );
                }}
              >
                {users
                  .filter((u) => !permissions.some((p) => p.userId === u.id))
                  .map((u) => (
                    <Select.Option key={u.id} value={u.id}>
                      {u.username}
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

        <div style={{ marginTop: "2rem" }}>
          <Button block onClick={() => router.push("/vaults")}>
            Return to the vaults page
          </Button>
        </div>
      </div>
    </App>
  );
};

export default VaultSettings;