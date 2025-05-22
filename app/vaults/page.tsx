"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
    Button,
    Card,
    Input,
    Typography,
    List,
    Space,
    Tag,
    message,
} from "antd";
import {
    UserOutlined,
    FolderOpenOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import {Vault} from "@/types/vault";
import {useApi} from "@/hooks/useApi";
import MovingBall from "@/components/MovingBall";

const {Title} = Typography;

const Vaults: React.FC = () => {
    const router = useRouter();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [newVaultName, setNewVaultName] = useState("");
    const apiService = useApi();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const originalBackground = document.body.style.backgroundColor;
        const originalOverflow = document.body.style.overflow;
        document.body.style.backgroundColor = "#cbe8ae";
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.backgroundColor = originalBackground;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        const fetchVaults = async () => {
            try {
                const id = localStorage.getItem("id");
                const accessToken = localStorage.getItem("accessToken");
                if (!accessToken || !id) {
                    router.push("/login");
                    return;
                }

                const response = await apiService.get<Vault[]>(`/vaults`, accessToken);
                if (!response) {
                    alert("No vaults available!");
                    return;
                }
                setVaults(response);
            } catch (error) {
                if (error instanceof Error) {
                    alert(`Something went wrong:\n${error.message}`);
                } else {
                    console.error("An unknown error occurred.");
                }
            }
        };
        fetchVaults();
    }, [apiService, router]);

    const handleCreateVault = async () => {
        if (!newVaultName.trim()) {
            messageApi.warning("Please enter a vault name.");
            return;
        }

        const name = newVaultName.trim();
        const accessToken = localStorage.getItem("accessToken");
        const ownerId = localStorage.getItem("id");

        if (!accessToken || !ownerId) {
            message.error("User not authenticated.");
            router.push("/login");
            return;
        }

        try {
            const response = await apiService.post<Vault>(
                "/vaults",
                {name, ownerId},
                accessToken
            );

            message.success("Vault created!");
            // EITHER redirect immediately:
            router.push(`/vaults/${response.id}/notes`);

            // OR stay on dashboard and just update list:
            // setVaults((prev) => [...prev, response]);

            setNewVaultName("");
        } catch (error) {
            if (error instanceof Error) {
                message.error(`Failed to create vault: ${error.message}`);
            } else {
                console.error("Unknown error:", error);
            }
        }
    };


    const handleLogout = async () => {
        const accessToken = localStorage.getItem("accessToken");
        const id = localStorage.getItem("id");
      
        if (!accessToken || !id) {
          messageApi.error("User not authenticated.");
          router.push("/login");
          return;
        }
      
        try {
          await apiService.post("/logout", { id }, accessToken);
          messageApi.success("You have been logged out.");
        } catch (error) {
          console.error("Logout failed:", error);
          messageApi.warning("Backend logout failed, but you're logged out locally.");
        }
      
        // Clear local session
        localStorage.removeItem("accessToken");
        localStorage.removeItem("id");
        localStorage.removeItem("username");
      
        // ✅ Delay the redirect to allow message to show
        setTimeout(() => {
          router.push("/");
        }, 1000); // 1 second delay
      };
      

    const myVaults = vaults.filter((v) => v.role === "OWNER");
    const sharedVaults = vaults.filter((v) => v.role !== "OWNER");

    return (
        <>
            {contextHolder}
            <div className="h-screen mx-12 relative overflow-hidden">
                <MovingBall/>

                <div className="flex justify-end gap-4 mb-6 p-8">
                    <Button
                        icon={<UserOutlined/>}
                        onClick={() => {
                            const id = localStorage.getItem("id");
                            if (id) {
                                router.push(`/profile/${id}`);
                            } else {
                                messageApi.error("User ID not found. Please login again.");
                            }
                        }}
                    >
                        Profile
                    </Button>

                    <Button icon={<LogoutOutlined/>} danger onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <div className="flex flex-wrap gap-[2rem] p-[2rem] relative z-10 h-full overflow-auto">
                    <Card style={{flex: 1, alignSelf: "flex-start"}}>
                        {myVaults.length > 0 && (
                            <>
                                <Title level={3}>My Vaults</Title>
                                <List
                                    bordered
                                    dataSource={myVaults}
                                    renderItem={(vault) => (
                                        <List.Item>
                                            <div className="flex justify-between w-full items-center">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpenOutlined style={{color: "#1677ff"}}/>
                                                    <span className="font-semibold text-base">{vault.name}</span>
                                                    <Tag color="geekblue">Vault ID: {vault.id}</Tag>
                                                </div>
                                                <Space>
                                                    <Button size="small"
                                                            onClick={() => router.push(`/vaults/${vault.id}/notes`)}>
                                                        Notes
                                                    </Button>
                                                    <Button size="small"
                                                            onClick={() => router.push(`/vaults/${vault.id}/settings`)}>
                                                        Settings
                                                    </Button>
                                                </Space>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}

                        {sharedVaults.length > 0 && (
                            <>
                                <Title level={3} style={{marginTop: "2rem"}}>
                                    Shared Vaults
                                </Title>
                                <List
                                    bordered
                                    dataSource={sharedVaults}
                                    renderItem={(vault) => (
                                        <List.Item>
                                            <div className="flex justify-between w-full items-center">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpenOutlined style={{color: "#52c41a"}}/>
                                                    <span className="font-semibold text-base">{vault.name}</span>
                                                    <Tag color="purple">Vault ID: {vault.id}</Tag>
                                                    <Tag color="orange">{vault.role}</Tag>
                                                </div>
                                                <Space>
                                                    <Button size="small"
                                                            onClick={() => router.push(`/vaults/${vault.id}/notes`)}>
                                                        Notes
                                                    </Button>
                                                </Space>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}
                        <div className="mt-6 pl-2">
                            <Button type="default" onClick={() => router.push("/shared-notes")}>
                                View All Shared Notes
                            </Button>
                        </div>
                    </Card>

                    <Card style={{width: 300}}>
                        <Title level={4}>Create New Vault</Title>
                        <Space direction="vertical" style={{width: "100%"}}>
                            <Input
                                placeholder="Vault Name"
                                value={newVaultName}
                                onChange={(e) => setNewVaultName(e.target.value)}
                            />
                            <Button type="primary" block onClick={handleCreateVault}>
                                Create Vault
                            </Button>

                        </Space>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Vaults;
