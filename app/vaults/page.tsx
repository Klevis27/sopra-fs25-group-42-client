"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Card, Input, Typography, List, Space, message} from "antd";
import {Vault} from "@/types/vault";
import {useApi} from "@/hooks/useApi";

const {Title} = Typography;

const Vaults: React.FC = () => {
    const router = useRouter();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [newVaultName, setNewVaultName] = useState("");
    const apiService = useApi();

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
                const response = await apiService.get<Vault[]>(`/vaults`, accessToken);

                // If no such user exists
                if (response == null) {
                    console.error("No such vaults exist");
                    alert("No such vaults exist!");
                    return
                }

                // Set Vaults
                setVaults(response)
            } catch (error) {
                // @ts-expect-error - No proper interface
                if (error.status == 404) {
                    console.error("Could not find vaults!");
                    alert("Vaults not found.");
                }
                // @ts-expect-error - No proper interface
                console.error("Error", error.status);
                alert("Unknown error occurred.");
            }
        };
        fetchNotes();
    }, [apiService, router]);

    // commented out for future use
    // const handleLogout = () => {
    //   localStorage.removeItem("accessToken");
    //   localStorage.removeItem("id");
    //   clearLoginCookie();
    //   router.push("/login");
    // };

    const handleContinueToCreation = () => {
        if (!newVaultName.trim()) {
            message.warning("Please enter a vault name.");
            return;
        }
        const encodedName = encodeURIComponent(newVaultName.trim());
        router.push(`/vaults/create?name=${encodedName}`);
    };

    return (
        <div className="m-12">
            <div className={"flex flex-wrap gap-[2rem] p-[2rem]"}>
                {/* Left Column: Vault List */}
                <Card style={{flex: 1}}>
                    <Title level={3}>My Vaults</Title>
                    <List
                        bordered
                        dataSource={vaults}
                        renderItem={(vault) => (
                            <List.Item>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        alignItems: "center",
                                    }}
                                >
                                    <span style={{fontWeight: 500}}>{vault.name}</span>
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => router.push(`/vaults/${vault.id}/notes`)}
                                        >
                                            Notes
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => router.push(`/vaults/${vault.id}/settings`)}
                                        >
                                            Settings
                                        </Button>
                                    </Space>
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>

                {/* Right Column: Create Vault */}
                <Card style={{width: 300}}>
                    <Title level={4}>Create New Vault</Title>
                    <Space direction="vertical" style={{width: "100%"}}>
                        <Input
                            placeholder="Vault Name"
                            value={newVaultName}
                            onChange={(e) => setNewVaultName(e.target.value)}
                        />
                        <Button type="primary" block onClick={handleContinueToCreation}>
                            Continue
                        </Button>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default Vaults;
