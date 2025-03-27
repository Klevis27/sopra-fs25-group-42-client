"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {User} from "@/types/user";
import {Button, Card, Table} from "antd";
import type {TableProps} from "antd";

// Columns for the antd table of User objects
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
        title: "Creation Date",
        dataIndex: "creationDate",
        key: "creationDate",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
    },
    {
        title: "Birthday",
        dataIndex: "birthday",
        key: "birthday",
    },
];

const Profile: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [userTableObject, setUserTableObject] = useState<User[] | null>(null);
    const params = useParams();
    const slug = params.id;
    const [editable, setEditable] = useState<boolean>(false);

    const goToDashboard = (): void => {
        router.push("/profile");
        return
    }
    const goToEdit = (): void => {
        router.push(`/profile/${slug}/edit`);
        return
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const id = localStorage.getItem("id");
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken || !id) {
                    router.push("/login");
                    return;
                }
                if (id == slug){
                    setEditable(true);
                }
                const response = await apiService.get<User>(`/users/${slug}`, accessToken);

                // If no such user exists
                if (response == null) {
                    console.error("No such user exists");
                    router.push("/profile");
                    return
                }

                if (!response.birthday) {
                    response.birthday = "N/A";
                }
                setUserTableObject([response]);
            } catch (error) {
                // @ts-expect-error - No proper interface
                if (error.status == 404) {
                    console.error("User with this ID could not be found");
                    alert("User with this ID could not be found");
                }
                // @ts-expect-error - No proper interface
                console.error("Error", error.status);
                router.push("/profile");
            }
        };
        fetchUser();
    }, [apiService, router, slug]);

    return (
        <div className="card-container">
            <Card
                title={"Profile Page"}
                loading={!userTableObject}
                className="dashboard-container"
            >
                {userTableObject && (
                    <>
                        {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
                        <Table<User>
                            columns={columns}
                            dataSource={userTableObject}
                            rowKey="id"
                            pagination={false}
                        />
                        <br/>
                        {editable && <><Button type="primary" onClick={goToEdit}> Edit </Button><br/><br/></>}
                        <Button onClick={goToDashboard} type="primary">
                            To the dashboard
                        </Button>
                    </>
                )}
            </Card>

        </div>
    );
};

export default Profile;
