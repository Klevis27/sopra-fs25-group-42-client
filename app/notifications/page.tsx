"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { VaultInvite } from "@/types/invite";
import {
  Card,
  Typography,
  Space,
  message,
  Button,
  Result,
  List,
  Tag,
  Badge,
  Skeleton,
  Avatar,
} from "antd";
import { UserAddOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const NotificationsPage: React.FC = () => {
  const [invites, setInvites] = useState<VaultInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const apiService = useApi();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const data = await apiService.get<VaultInvite[]>("/invite/me", token);
        setInvites(data);
      } catch {
        message.error("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiService, router]);

  const handleAccept = async (token: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      await apiService.post(`/invite/${token}/accept`, {}, accessToken);
      message.success("You have joined the vault.");
      setInvites((prev) => prev.filter((inv) => inv.token !== token));
    } catch {
      message.error("Failed to accept invitation.");
    }
  };

  const roleColor = (role: string) =>
    role === "OWNER" ? "gold" : role === "EDITOR" ? "green" : "blue";

  return (
    <div className="m-12 flex justify-center">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl p-6">
        <Space direction="vertical" size="large" className="w-full">
          <Badge
            count={invites.length}
            offset={[8, -2]}
            size="small"
            overflowCount={99}
          >
            <Title level={3} className="!mb-0">
              Notifications
            </Title>
          </Badge>

          {loading ? (
            <Skeleton active />
          ) : invites.length === 0 ? (
            <Result
              icon={<MailOutlined />}
              title="No invitations yet"
              subTitle="You will see your vault invites here."
            />
          ) : (
            <List
              dataSource={invites}
              itemLayout="horizontal"
              renderItem={(invite, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <List.Item
                    className="rounded-xl hover:bg-gray-50 transition-colors"
                    actions={[
                      <Button
                        key="accept"
                        type="primary"
                        onClick={() => handleAccept(invite.token)}
                        icon={<UserAddOutlined />}
                      >
                        Accept
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          icon={<MailOutlined />}
                          className="bg-blue-100 text-blue-600"
                        />
                      }
                      title={
                        <Text strong>
                          Invitation to&nbsp;
                          <Text keyboard>{invite.vaultName}</Text>
                        </Text>
                      }
                      description={
                        <>
                          <Text>
                            Role:&nbsp;
                            <Tag color={roleColor(invite.role)}>{invite.role}</Tag>
                          </Text>
                          <br />
                          <Text type="secondary" style={{ color: "white" }}>
                            Sent:&nbsp;
                            {dayjs(invite.createdAt).format("YYYY-MM-DD HH:mm")}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                </motion.div>
              )}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default NotificationsPage;