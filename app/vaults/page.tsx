"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {User} from "@/types/user";
import {Button, Card, Table} from "antd";
import type {TableProps} from "antd";
import {clearLoginCookie} from "@/utils/cookies";

const columns: TableProps<User>["columns"] = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Username",
        dataIndex: "username",
        key: "username",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
    },
];

const Vaults: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [users, setUsers] = useState<User[] | null>(null);

    const handleLogout = async (): Promise<void> => {
        const accessToken = localStorage.getItem("accessToken");
        const id = localStorage.getItem("id");
        if (!accessToken || !id) {
            router.push("/login");
            return;
        }
        try {
            const userData = {
                id: id,
            };
            await apiService.post("/logout", userData, accessToken);
            localStorage.removeItem("id");
            localStorage.removeItem("accessToken");
            clearLoginCookie();
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

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
    }, [apiService, router]); // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
    // if the dependency array is left empty, the useEffect will trigger exactly once
    // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to profile in the useEffect, this results in an infinite loop.
    // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

    return (
        <div className="card-container">
            <Card
                title="All vaults: [TBD]"
                loading={!users}
                className="dashboard-container"
            >
                {users && (
                    <>
                        {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
                        <Table<User>
                            columns={columns}
                            dataSource={users}
                            rowKey="id"
                            onRow={(row) => ({
                                onClick: () => router.push(`/profile/${row.id}`),
                                style: {cursor: "pointer"},
                            })}
                        />
                        <Button onClick={handleLogout} type="primary">
                            Logout
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
};

export default Vaults;
