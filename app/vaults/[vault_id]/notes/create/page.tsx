"use client";
import '@ant-design/v5-patch-for-react-19';
import {useApi} from "@/hooks/useApi";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {Button, Card, Form, Input, Typography} from "antd";
import {App} from "antd";
import {Suspense} from "react";
import {Note} from "@/types/note";
import { AxiosError } from "axios";

const {Title} = Typography;

const CreateNote: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get("name") || "";
    const apiService = useApi();
    const [form] = Form.useForm();
    const {message} = App.useApp();
    const params = useParams();
    const vaultId = params.vault_id as string;

    const handleCreateNote = async (values: { name: string }) => {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
            router.push("/login");
            return;
        }
        try {
            // Call the API service and let it handle JSON serialization and error handling
            const noteData = {
                title: values.name,
            };
            const response = await apiService.post<{ message : string, note : Note }>(`/vaults/${vaultId}/notes`, noteData, accessToken);

            // Navigate to the notes overview of the newly created vault
            message.success("Note created successfully!");
            router.push(`/vaults/${vaultId}/notes/${response.note.id}`);
        } catch (error: unknown) {
            if (error && typeof error === "object" && "isAxiosError" in error) {
                const axiosError = error as AxiosError<{ message: string }>;
                const backendMessage = axiosError.response?.data?.message;
                if (backendMessage) {
                    alert(`Error: ${backendMessage}`);
                } else {
                    alert("An error occurred while creating the note.");
                }
            } else if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert("An unknown error occurred.");
            }
            form.resetFields();
            router.push("/vaults");
        
        // catch (error: unknown) {
        //     if (error instanceof Error) {
        //         alert(`Note name already taken`);
        //     } else {
        //         // Handle unknown error
        //         console.error("An unknown error occurred during creation of note.");
        //         alert("An unknown error occurred.");
        //     }
        //     form.resetFields();
        //     router.push("/vaults");
        }
    };

    return (
        <div style={{padding: "2rem", maxWidth: 500, margin: "0 auto"}}>
            <Card>
                <Title level={3}>Create a New Note</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateNote}
                    initialValues={{name: initialName}}
                >
                    <Form.Item
                        label="Vault Name"
                        name="name"
                        rules={[{required: true, message: "Please enter a vault name"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Create Note
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

const WrappedCreateNote = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <CreateNote/>
    </Suspense>
);

export default WrappedCreateNote;
