"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Form, Input, Select, Typography, message } from "antd";

const { Title } = Typography;

type Vault = {
  id: string;
  name: string;
  state: string;
};

const VaultSettings: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const vaultId = params.vault_id as string;
  const [form] = Form.useForm();
  const [vault, setVault] = useState<Vault | null>(null);

  useEffect(() => {
    // Simulate fetching the vault from localStorage
    const allVaults = JSON.parse(localStorage.getItem("vaults") || "[]");
    const foundVault = allVaults.find((v: Vault) => v.id === vaultId);

    if (!foundVault) {
      message.error("Vault not found.");
      router.push("/vaults");
      return;
    }

    setVault(foundVault);
    form.setFieldsValue({
      name: foundVault.name,
      state: foundVault.state,
    });
  }, [vaultId, router, form]);

  const handleSave = (values: { name: string; state: string }) => {
    if (!vault) return;

    const updatedVault: Vault = {
      ...vault,
      name: values.name,
      state: values.state,
    };

    // Simulate saving vault to localStorage
    const allVaults = JSON.parse(localStorage.getItem("vaults") || "[]");
    const newVaults = allVaults.map((v: Vault) =>
      v.id === vaultId ? updatedVault : v
    );
    localStorage.setItem("vaults", JSON.stringify(newVaults));

    message.success("Vault updated successfully!");
    router.push("/vaults");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <Card loading={!vault}>
        <Title level={3}>Edit Vault</Title>
        {vault && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              name: vault.name,
              state: vault.state,
            }}
          >
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
          </Form>
        )}
      </Card>
    </div>
  );
};

export default VaultSettings;
