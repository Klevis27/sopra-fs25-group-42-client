"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Form, Input } from "antd";

interface EditPageProps {
  username: string | null;
}

const Edit: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [userTableObject, setUserTableObject] = useState<User[] | null>(null);
  const [form] = Form.useForm();
  const params = useParams();
  const slug = params.id;

  const goToProfile = (): void => {
    router.push(`/profile/${slug}`);
  };

  const handleEdit = async (values: EditPageProps) => {
    try {
      const id = localStorage.getItem("id");
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || !id) {
        router.push("/login");
        return;
      }
      const username = values.username;
      const currentUser = userTableObject?.[0];

      // Check if anything changed
      if (
        currentUser &&
        username === currentUser.username
      ) {
        router.push(`/profile/${slug}`);
        return;
      }

      const userData = {
        id: slug,
        username: username !== currentUser?.username ? username : null,
      };
      try {
        await apiService.put<User>(`/users/${slug}`, userData, accessToken);
        router.push(`/profile/${slug}`);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status: number }).status === 409
        ) {
          form.setFields([
            {
              name: "username",
              errors: ["This username is already taken."],
            },
          ]);
        } else if (error instanceof Error) {
          alert(`Something went wrong during update:\n${error.message}`);
        } else {
          console.error("An unknown error occurred during update.");
        }
      }
      
      

    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during update:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during update.");
      }
    }
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
        if (id != slug) {
          router.push(`/profile/${slug}`);
          return;
        }
        const response = await apiService.get<User>(`/users/${slug}`, accessToken);

        setUserTableObject([ response ]);

        form.setFieldsValue({
          username: response.username,
        });
      } catch {
        router.push(`/profile/${slug}`);
      }
    };
    fetchUser();
  }, [apiService, router, slug, form]);

  return (
    <div className="card-container">
      <Card
  title="Edit Profile"
  className="dashboard-container"
>
  <Form
    form={form}
    name="edit"
    size="large"
    onFinish={handleEdit}
    layout="vertical"
  >
    <Form.Item
      name="username"
      label="Username"
    >
      <Input placeholder="Enter username" />
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form.Item>
  </Form>

  <Button onClick={goToProfile} type="primary" style={{ backgroundColor: 'red' }}>
    Cancel
  </Button>
</Card>

    </div>
  );
};

export default Edit;