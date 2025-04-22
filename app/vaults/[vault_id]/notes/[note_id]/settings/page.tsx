"use client";

import "@ant-design/v5-patch-for-react-19";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Card, Form, Input, message } from "antd";

const NoteSettings: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const params = useParams();
  const noteId = params.note_id as string;
  const vaultId = params.vault_id as string;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSendInvitation = async (values: { username: string }) => {
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
        { username: values.username },
        accessToken
      );

      message.success(`Invitation sent to ${values.username}!`);
      form.resetFields();
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Invitation
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="default"
          onClick={() => router.push(`/vaults/${vaultId}/notes/${noteId}`)}
        >
          Back to Note
        </Button>
      </Card>
    </div>
  );
};

export default NoteSettings;
