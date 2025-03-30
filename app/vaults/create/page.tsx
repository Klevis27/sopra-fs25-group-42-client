"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Form, Input, Select, Typography } from "antd";
import { App } from "antd";

const { Title } = Typography;

type Vault = {
  id: string;
  name: string;
  state: string;
};

const CreateVault: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "";

  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleCreateVault = (values: { name: string; state: string }) => {
    // Simulate saving new vault (replace with API call later)
    const newVault: Vault = {
      id: String(Date.now()),
      name: values.name,
      state: values.state,
    };

    // Store in localStorage temporarily (just for demo purposes)
    let existing: Vault[] = [];
    try {
      const stored = localStorage.getItem("vaults");
      existing = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Failed to parse vaults from localStorage:", e);
      existing = [];
    }

    localStorage.setItem("vaults", JSON.stringify([...existing, newVault]));

    message.success("Vault created successfully!");
    router.push("/vaults");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <Card>
        <Title level={3}>Create a New Vault</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVault}
          initialValues={{ name: initialName, state: "Private" }}
        >
          <Form.Item
            label="Vault Name"
            name="name"
            rules={[{ required: true, message: "Please enter a vault name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Visibility"
            name="state"
            rules={[{ required: true, message: "Please select a state" }]}
          >
            <Select>
              <Select.Option value="Private">Private</Select.Option>
              <Select.Option value="Shared">Shared</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Vault
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="default" block onClick={() => router.push("/vaults")}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateVault;
