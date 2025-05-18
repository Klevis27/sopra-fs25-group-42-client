"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {User} from "@/types/user";
import {Button, Card, Table} from "antd";
import type {TableProps} from "antd";

const columns: TableProps<User>["columns"] = [
    {
        title: <span style={{color: "#ffffff"}}>Id</span>,
        dataIndex: "id",
        key: "id",
        render: (text) => <span style={{color: "#ffffff"}}>{text}</span>,
    },
    {
        title: <span style={{color: "#ffffff"}}>Username</span>,
        dataIndex: "username",
        key: "username",
        render: (text) => <span style={{color: "#ffffff"}}>{text}</span>,
    },
    {
        title: <span style={{color: "#ffffff"}}>Status</span>,
        dataIndex: "status",
        key: "status",
        render: (text) => <span style={{color: "#ffffff"}}>{text}</span>,
    },
];

const Dashboard: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [users, setUsers] = useState<User[] | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const id = localStorage.getItem("id");
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken || !id) {
                    router.push("/login");
                    return;
                }
                const response = await apiService.get<User[]>("/users", accessToken);
                if (response[0] == null) {
                    router.push("/login");
                }
                setUsers(response);
            } catch (error) {
                console.error("Error fetching profile:", error);
                router.push("/login");
            }
        };
        fetchUsers();
    }, [apiService, router]);

    return (
        <div className="card-container">
            <Card
                title={<span style={{color: "#ffffff"}}>All users:</span>}
                loading={!users}
                className="dashboard-container"
            >
                {users && (
                    <>
                        <Table<User>
                            columns={columns}
                            dataSource={users}
                            rowKey="id"
                            onRow={(row) => ({
                                onClick: () => router.push(`/profile/${row.id}`),
                                style: {cursor: "pointer"},
                            })}
                        />
                        <Button
                            type="default"
                            onClick={() => {
                                const id = localStorage.getItem("id");
                                if (id) {
                                    router.push(`/profile/${id}`);
                                }
                            }}
                        >
                            ← Back to Profile
                        </Button>

                    </>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;