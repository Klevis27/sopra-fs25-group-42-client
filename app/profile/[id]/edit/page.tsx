"use client";
import '@ant-design/v5-patch-for-react-19';
import React, {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {useApi} from "@/hooks/useApi";
import {User} from "@/types/user";
import {Button, Card, Form, DatePicker, Input, ConfigProvider} from "antd";
import dayjs, {Dayjs} from "dayjs";

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
        return
    }

    const handleEdit = async (values: EditPageProps) => {
        try {
            // Check session
            const id = localStorage.getItem("id");
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken || !id) {
                router.push("/login");
                return;
            }

            // Prepare Date
            let birthday = values.birthday ? dayjs(values.birthday).format("YYYY-MM-DD") : null;

            // Did username change?
            let username = values.username;
            if (userTableObject && username == userTableObject[0].username) {
                username = null
            }

            // Did birthday change?
            if (userTableObject && birthday == userTableObject[0].birthday) {
                birthday = null;
            }

            // Did either change?
            if (!username && !birthday) {
                router.push(`/profile/${slug}`); // TODO Alert: No Changes
                return;
            }

            // Set data if something changed
            const userData = {
                id: slug,
                username: username,
                birthday: birthday,
            };

            // Call the API service and let it handle JSON serialization and error handling
            await apiService.put<User>(`/users/${slug}`, userData, accessToken);
            router.push(`/profile/${slug}`);

        } catch (error) {
            if (error instanceof Error) {
                alert(`Something went wrong during registration:\n${error.message}`);
            } else {
                console.error("An unknown error occurred during login.");
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
                    router.push(`/profile/${slug}`); // TODO Alert: No access to this profile edit page
                    return;
                }
                const response = await apiService.get<User>(`/users/${slug}`, accessToken);

                // Prepare for DatePicker
                if (response.birthday) {
                    response.birthday = dayjs(response.birthday, "YYYY-MM-DD");
                } else {
                    response.birthday = null;
                }

                setUserTableObject([response]);

                form.setFieldsValue({
                    username: response.username,
                    birthday: response.birthday, // :(
                });
            } catch (error) {
                // @ts-expect-error - No proper interface
                if (error.status == 404) {
                    console.error("User with this ID could not be found");
                    alert("User with this ID could not be found");
                }
                // @ts-expect-error - No proper interface
                console.error("Error", error.status);
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
                            name="signup"
                            size="large"
                            variant="outlined"
                            onFinish={handleEdit}
                            layout="vertical">
                            <Form.Item
                                name="username"
                                label="Username"
                                initialValue={userTableObject[0].username}
                            >
                                <Input placeholder="Enter username"/>
                            </Form.Item>
                            <Form.Item
                                name="birthday"
                                label="Birthday (YYYY-MM-DD)"
                                initialValue={userTableObject[0].birthday} // Cannot figure this one out for the life of me
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
                                        onChange={(date) => form.setFieldsValue({ birthday: date })}
                                    />
                                </ConfigProvider>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="login-button">
                                    save
                                </Button>
                            </Form.Item>
                        </Form>

                        <Button onClick={goToProfile} type="primary" style={{
                            backgroundColor: 'red',
                        }}>
                            Cancel
                        </Button>
                    </>
                )}
            </Card>

        </div>
    );
};

export default Edit;




