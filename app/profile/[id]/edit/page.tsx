"use client";
import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Form, DatePicker, Input, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface EditPageProps {
  username: string | null;
  birthday: Dayjs | null;
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

      let birthday = values.birthday ? values.birthday.format("YYYY-MM-DD") : null;
      let username = values.username;
      const currentUser = userTableObject?.[0];

      // Check if anything changed
      if (
        currentUser &&
        username === currentUser.username &&
        birthday === (dayjs.isDayjs(currentUser.birthday) ? currentUser.birthday.format("YYYY-MM-DD") : currentUser.birthday)
      ) {
        router.push(`/profile/${slug}`);
        return;
      }

      const userData = {
        id: slug,
        username: username !== currentUser?.username ? username : null,
        birthday: birthday !== (dayjs.isDayjs(currentUser?.birthday) ? currentUser.birthday.format("YYYY-MM-DD") : currentUser?.birthday) ? birthday : null,
      };
      console.log("GÖNDERİLEN VERİ:", userData);
      await apiService.put<User>(`/users/${slug}`, userData, accessToken);
      router.push(`/profile/${slug}`);

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

        const birthdayDayjs = response.birthday ? dayjs(response.birthday) : null;

        setUserTableObject([{ ...response, birthday: birthdayDayjs }]);

        form.setFieldsValue({
          username: response.username,
          birthday: birthdayDayjs,
        });
      } catch (error) {
        router.push(`/profile/${slug}`);
      }
    };
    fetchUser();
  }, [apiService, router, slug, form]);

  return (
    <div className="card-container">
      <Card
        title="Edit Profile"
        loading={!userTableObject}
        className="dashboard-container"
      >
        {userTableObject && (
          <>
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
                initialValue={userTableObject[0].username}
              >
                <Input placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                name="birthday"
                label="Birthday (YYYY-MM-DD)"
                initialValue={userTableObject[0].birthday}
              >
                <ConfigProvider
                  theme={{
                    token: {
                      colorTextPlaceholder: "#777",
                      colorBgElevated: "#777",
                    },
                  }}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    style={{ width: "100%" }}
                  />
                </ConfigProvider>
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
          </>
        )}
      </Card>
    </div>
  );
};

export default Edit;