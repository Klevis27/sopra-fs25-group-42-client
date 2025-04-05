"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {Button, Card, Table} from "antd";
import type {TableProps} from "antd";
import {Note} from "@/types/note";

// Columns for the antd table of User objects
const columns: TableProps<Note>["columns"] = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Title",
        dataIndex: "title",
        key: "title",
    },
];

const Vault: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [notesTableObject, setNotesTableObject] = useState<Note[] | null>(null);
    const pathname = usePathname();
    const vaultId = pathname.split("/")[2]; // `/vaults/[vault_id]/notes`

    const goToDashboard = (): void => {
        router.push("/vaults");
        return
    }

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const id = localStorage.getItem("id");
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken || !id) {
                    router.push("/login");
                    return;
                }

                // API Call
                const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`, accessToken);

                // If no such user exists
                if (response == null) {
                    console.error("No such notes exist");
                    alert("No such notes exist!");
                    return
                }
                setNotesTableObject(response)
            } catch (error) {
                // @ts-expect-error - No proper interface
                if (error.status == 404) {
                    console.error("Could not find notes!");
                    alert("Notes not found.");
                }
                // @ts-expect-error - No proper interface
                console.error("Error", error.status);
                alert("Unknown error occurred.");
            }
        };
        fetchNotes();
    }, [apiService, router, vaultId]);

    return (
        <div className="card-container">
            <Card
                title={`Notes in TODO`}
                loading={!notesTableObject}
                className="dashboard-container"
            >
                {notesTableObject && (
                    <>
                        {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
                        <Table<Note>
                            columns={columns}
                            dataSource={notesTableObject}
                            rowKey="id"
                            onRow={(row) => ({
                                onClick: () => router.push(`/profile/${row.id}`),
                                style: {cursor: "pointer"},
                            })}
                        />
                        <Button onClick={goToDashboard} type="primary">
                            To the dashboard
                        </Button>
                    </>
                )}
            </Card>

        </div>
    );
};

export default Vault;
