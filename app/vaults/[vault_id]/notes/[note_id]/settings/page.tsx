"use client";

import "@ant-design/v5-patch-for-react-19";
import React, {useState, useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {
    Button,
    Card,
    Form,
    Select,
    Table,
    Typography,
    App,
    message,
    Modal,
    Input,
} from "antd";
import type {DefaultOptionType} from "antd/es/select";

const {Title} = Typography;

type User = {
    id: number;
    username: string;
};

type NotePermission = {
    username: string;
    role: "VIEWER" | "EDITOR" | "OWNER";
};

type Note = {
    id: number;
    title: string;
};

function hasStatus(error: unknown): error is { status: number } {
    return typeof error === "object" && error !== null && "status" in error;
}

const NoteSettings: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const params = useParams();
    const noteId = params.note_id as string;
    const vaultId = params.vault_id as string;

    const [permForm] = Form.useForm();
    const [users, setUsers] = useState<User[]>([]);
    const [permissions, setPermissions] = useState<NotePermission[]>([]);
    const [noteTitle, setNoteTitle] = useState<string>("");
    const [messageApi, contextHolder] = message.useMessage();
    const [myRole, setMyRole] = useState<"VIEWER" | "EDITOR" | "OWNER" | null>(null);

    const userOptions: DefaultOptionType[] = users
        .filter((u) => !permissions.some((p) => p.username === u.username))
        .map((u) => ({label: u.username, value: u.username}));

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "#cbe8ae";
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        apiService
            .get<Note>(`/notes/${noteId}`, accessToken)
            .then((note) => setNoteTitle(note.title))
            .catch(() => messageApi.error("Failed to load note title"));

        apiService
            .get<User[]>("/users", accessToken)
            .then(setUsers)
            .catch(() => messageApi.error("Failed to load users"));

        apiService
            .get<NotePermission[]>(`/notes/${noteId}/permissions`, accessToken)
            .then((perms) => {
                setPermissions(perms);
                const currentUsername = localStorage.getItem("username");
                const myPerm = perms.find(p => p.username === currentUsername);
                if (myPerm) setMyRole(myPerm.role);
            })
            .catch(() => messageApi.error("Failed to load note permissions"));
    }, [noteId, apiService, messageApi]);

    const handleSendInvitation = async (values: {
        username: string;
        role: "VIEWER" | "EDITOR";
    }) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            messageApi.error("You must be logged in.");
            router.push("/login");
            return;
        }

        try {
            await apiService.post(
                `/notes/${noteId}/invite`,
                {
                    username: values.username,
                    role: values.role,
                },
                accessToken
            );

            messageApi.success(
                `Invitation sent to ${values.username} as ${values.role.toLowerCase()}`
            );
            permForm.resetFields();

            const updated = await apiService.get<NotePermission[]>(
                `/notes/${noteId}/permissions`,
                accessToken
            );
            setPermissions(updated);

            const currentUsername = localStorage.getItem("username");
            const myPerm = updated.find(p => p.username === currentUsername);
            if (myPerm) setMyRole(myPerm.role);
        } catch (error: unknown) {
            if (hasStatus(error)) {
                if (error.status === 409) {
                    messageApi.warning("User already has permission to this note.");
                } else if (error.status === 404) {
                    messageApi.error("User not found.");
                } else if (error.status === 403) {
                    messageApi.error("You are not allowed to do this.");
                } else {
                    messageApi.error("Unexpected error occurred.");
                }
            } else {
                messageApi.error("Unexpected error occurred.");
            }
        }
    };

    const handleNameChange = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        try {
            await apiService.put(
                `/notes/${noteId}`,
                {title: noteTitle},
                accessToken
            );
            messageApi.success("Note name updated");
        } catch {
            messageApi.error("Failed to update name");
        }
    };

    const handleDeleteNote = () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        Modal.confirm({
            title: "Are you sure you want to delete this note?",
            okText: "Yes, delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await apiService.delete(`/notes/${noteId}`, accessToken);
                    messageApi.success("Note deleted");
                    router.push(`/vaults/${vaultId}/notes`);
                } catch {
                    messageApi.error("Failed to delete note");
                }
            },
        });
    };

    return (
        <App>
            {contextHolder}
            <div style={{
                padding: "2rem",
                maxWidth: 700,
                margin: "0 auto",
                backgroundColor: "#cbe8ae",
                minHeight: "100vh"
            }}>
                <Card>
                    <Title level={3}>Note Permissions</Title>

                    <Card
                        size="small"
                        style={{
                            marginBottom: 24,
                            backgroundColor: "#1f1f1f",
                            border: "1px solid #434343",
                            color: "#ffffff",
                        }}
                    >
                        <Title level={5} style={{color: "#ffffff"}}>
                            Change Note Name
                        </Title>
                        <Form layout="inline" onFinish={handleNameChange}>
                            <Form.Item style={{flex: 1}}>
                                <Input
                                    style={{
                                        width: 400,
                                        padding: 8,
                                        border: "1px solid #434343",
                                        borderRadius: 4,
                                        backgroundColor: "#141414",
                                        color: "#ffffff",
                                    }}
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button htmlType="submit" type="primary">
                                    Save name
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    <Form layout="inline" form={permForm} onFinish={handleSendInvitation}>
                        <Form.Item
                            name="username"
                            rules={[{required: true, message: "Select a user"}]}
                        >
                            <Select
                                showSearch
                                placeholder="Select user"
                                style={{width: 200, color: "white"}}
                                dropdownStyle={{backgroundColor: "#1f1f1f", color: "#ffffff"}}
                                options={userOptions}
                                filterOption={(input, option) =>
                                    (option?.label as string)
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>


                        <Form.Item
                            name="role"
                            rules={[{required: true, message: "Select role"}]}
                        >
                            <Select
                                placeholder="Select role"
                                style={{width: 150, color: "white"}}
                                dropdownStyle={{backgroundColor: "#1f1f1f", color: "#ffffff"}}
                                options={[
                                    {label: "Editor", value: "EDITOR"},
                                    {label: "Viewer", value: "VIEWER"},
                                ]}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button htmlType="submit" type="primary">
                                Add
                            </Button>
                        </Form.Item>
                    </Form>

                    <Table
                        style={{marginTop: "1rem"}}
                        dataSource={permissions}
                        rowKey="username"
                        pagination={false}
                        columns={[
                            {title: "Username", dataIndex: "username"},
                            {title: "Role", dataIndex: "role"},
                        ]}
                    />
                </Card>

                {myRole === "OWNER" && (
                    <div style={{marginTop: "2rem"}}>
                        <Button danger block onClick={handleDeleteNote}>
                            Delete Note
                        </Button>
                    </div>
                )}

                <div style={{marginTop: "1rem"}}>
                    <Button
                        type="default"
                        block
                        onClick={() => router.push(`/vaults/${vaultId}/notes`)}
                    >
                        Return to the note
                    </Button>
                </div>
            </div>
        </App>
    );
};

export default NoteSettings;
