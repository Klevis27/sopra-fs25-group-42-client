"use client";

import "@ant-design/v5-patch-for-react-19";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Card, Form, Input, message, Select } from "antd";

const NoteSettings: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const params = useParams();
  const noteId = params.note_id as string;
  const vaultId = params.vault_id as string;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<{ username: string; role: string }[]>([]);

  const handleSendInvitation = async (values: { username: string; role: string }) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("You must be logged in.");
        router.push("/login");
        return;
      }

      await apiService.post(
        `/notes/${noteId}/invite`,
        {
          username: values.username,
          role: values.role,
        },
        accessToken
      );

      message.success(`Invitation sent to ${values.username} as ${values.role}!`);
      form.resetFields();

      // Fetch updated permissions list
      const data = await apiService.get<{ username: string; role: string }[]>(
        `/notes/${noteId}/permissions`,
        accessToken
      );
      setPermissions(data);

    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
      ) {
        const status = (error as { status: number }).status;

        if (status === 409) {
          message.warning("User already has permission to this note.");
        } else if (status === 404) {
          message.error("User not found.");
        } else {
          message.error("Something went wrong.");
        }
      } else {
        message.error("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const data = await apiService.get<{ username: string; role: string }[]>(
          `/notes/${noteId}/permissions`,
          accessToken
        );
        setPermissions(data);
      } catch (err) {
        console.error("Failed to fetch note permissions:", err);
      }
    };

    fetchPermissions();
  }, [noteId, apiService]);

  return (
    <div className="card-container">
      <Card
        title={`Vault Settings (Vault ID: ${vaultId})`}
        className="dashboard-container"
      >
        <Form
          form={form}
          name="invite"
          onFinish={handleSendInvitation}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Invite user by username"
            rules={[{ required: true, message: "Please enter a username." }]}
          >
            <Input placeholder="Enter username (e.g. edi)" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Assign role"
            rules={[{ required: true, message: "Please select a role." }]}
          >
            <Select placeholder="Choose a role">
              <Select.Option value="reader">Reader</Select.Option>
              <Select.Option value="editor">Editor</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Invitation
            </Button>
          </Form.Item>
        </Form>

        {permissions.length > 0 && (
  <div
    style={{
      marginTop: "32px",
      padding: "16px",
      background: "#f6f6f6",
      border: "1px solid #ddd",
      borderRadius: "8px",
    }}
  >
    <h3
      style={{
        fontSize: "18px",
        fontWeight: 600,
        marginBottom: "12px",
        color: "#222",
      }}
    >
      👥 Users with access to this note
    </h3>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {permissions.map((perm, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#333",
          }}
        >
          <span>
            <strong>{perm.username}</strong>
          </span>
          <span style={{ fontStyle: "italic", color: "#888" }}>
            {perm.role}
          </span>
        </div>
      ))}
    </div>
  </div>
)}


        <Button
          type="default"
          onClick={() => router.push(`/vaults/${vaultId}/notes/${noteId}`)}
          style={{ marginTop: "16px" }}
        >
          Back to Note
        </Button>
      </Card>
    </div>
  );
};

export default NoteSettings;
