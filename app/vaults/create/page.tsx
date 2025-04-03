"use client";
import '@ant-design/v5-patch-for-react-19';
import {useApi} from "@/hooks/useApi";
// import React, { useState } from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button, Card, Form, Input, Select, Typography} from "antd";
import {App} from "antd";
import {Suspense} from "react";
import {Vault} from "@/types/vault";

const {Title} = Typography;

const CreateVault: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get("name") || "";
    const apiService = useApi();
    const [form] = Form.useForm();
    const {message} = App.useApp();

    const handleCreateVault = async (values: { name: string; state: string }) => {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
            router.push("/login");
            return;
        }
        try {
            // Call the API service and let it handle JSON serialization and error handling
            const vaultData = {
                name: values.name,
                state: values.state,
            };
            const response = await apiService.post<Vault>("/vault", vaultData, accessToken);

            // Navigate to the notes overview of the newly created vault
            message.success("Vault created successfully!");
            router.push(`/vaults/${response.id}/notes`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`Vault name already taken`);
            } else {
                // Handle unknown error
                console.error("An unknown error occurred during creation of vault.");
                alert("An unknown error occurred.");
            }
            form.resetFields();
            router.push("/vaults");
        }
    };

    return (
        <div style={{padding: "2rem", maxWidth: 500, margin: "0 auto"}}>
            <Card>
                <Title level={3}>Create a New Vault</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateVault}
                    initialValues={{name: initialName, state: "Private"}}
                >
                    <Form.Item
                        label="Vault Name"
                        name="name"
                        rules={[{required: true, message: "Please enter a vault name"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Visibility"
                        name="state"
                        rules={[{required: true, message: "Please select a state"}]}
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

const WrappedCreateVault = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <CreateVault/>
    </Suspense>
);

export default WrappedCreateVault;
