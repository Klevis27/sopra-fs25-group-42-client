"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import dayjs, { Dayjs } from "dayjs";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const params = useParams();
  const slug = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [editable, setEditable] = useState(false);

  const goToDashboard = () => router.push("/profile");
  const goToEdit = () => router.push(`/profile/${slug}/edit`);
  const goToVaults = () => router.push("/vaults");

  // ✅ Supports Date | Dayjs | string | null
  const formatDate = (value?: string | Date | Dayjs | null): string => {
    if (!value) return "N/A";
    if (dayjs.isDayjs(value)) return value.toDate().toLocaleDateString();
    if (value instanceof Date) return value.toLocaleDateString();
    return new Date(value).toLocaleDateString();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = localStorage.getItem("id");
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken || !id) {
          router.push("/login");
          return;
        }
        if (id === slug) {
          setEditable(true);
        }

        const response = await apiService.get<User>(`/users/${slug}`, accessToken);
        if (!response) {
          message.error("No such user exists");
          router.push("/profile");
          return;
        }
        setUser({
          ...response,
          birthday: response.birthday || null,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Something went wrong during update:\n${error.message}`);
        } else {
          console.error("An unknown error occurred during update.");
        }

        router.push("/profile");
      }
    };
    fetchUser();
  }, [apiService, router, slug]);

  return (
    <div className="m-12 flex justify-center">
      <Card
        className="w-full max-w-3xl shadow-2xl"
        title={<Title level={3}>Profile</Title>}
        extra={
          editable && (
            <Button type="primary" icon={<EditOutlined />} onClick={goToEdit}>
              Edit
            </Button>
          )
        }
      >
        {!user ? (
          <Spin tip="Loading..." size="large" className="flex justify-center" />
        ) : (
          <Space direction="vertical" size="large" className="w-full">
            <Row justify="center">
              <Avatar size={96} icon={<UserOutlined />} />
            </Row>

            <Descriptions bordered column={1} size="middle" className="mx-auto w-full md:w-2/3">
              <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
              <Descriptions.Item label="Creation Date">{formatDate(user.creationDate)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={user.status === "ACTIVE" ? "green" : "default"}>{user.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Birthday">{formatDate(user.birthday)}</Descriptions.Item>
            </Descriptions>

            <Row justify="center" gutter={16}>
              <Space size="middle">
                <Button type="primary" icon={<DashboardOutlined />} onClick={goToDashboard}>
                  Dashboard
                </Button>
                <Button icon={<FolderOpenOutlined />} onClick={goToVaults}>
                  Vaults
                </Button>
              </Space>
            </Row>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default Profile;