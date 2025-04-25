"use client";

import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import { setCookie } from "@/utils/cookies";
import {SpinningLogo} from "@/components/Design";

interface RegistrationFormValues {
    username: string;
    password: string;
}

const Registration: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();

    const handleRegistration = async (values: RegistrationFormValues) => {
        try {
            const response = await apiService.post<User>("/users", {
                username: values.username,
                password: values.password,
            });

            if (response.accessToken && response.id) {
                setCookie("accessToken", response.accessToken, 1);
                setCookie("id", response.id, 1);
                localStorage.setItem("id", response.id);
                localStorage.setItem("accessToken", response.accessToken);
            }
            router.push("/vaults");
        } catch {
            alert("Registration failed — username may already be taken.");
            form.resetFields();
            router.push("/register");
        }
    };

    return (
        <div className="relative min-h-screen bg-[#c5eba2] text-black overflow-x-hidden">
            {/* Header with centered logo */}
            <header className="flex justify-center pt-6">
                <SpinningLogo/>
            </header>

            {/* Registration panel on the right */}
            <div className="absolute top-0 right-[50px] w-[550px] h-screen bg-[#A0BF84]/70 p-5 flex items-center justify-center">
                <Form
                    form={form}
                    name="signup"
                    size="large"
                    layout="vertical"
                    requiredMark={false}
                    onFinish={handleRegistration}
                    className="w-full"
                >
                    <h1 className="text-2xl font-bold text-center text-black mb-6">
                        Register
                    </h1>

                    <Form.Item
                        name="username"
                        label={
                            <span className="text-black font-bold text-base">Username</span>
                        }
                        rules={[{ required: true, message: "Please input your username!" }]}
                    >
                        <Input
                            placeholder="E.g: Marx420"
                            className="bg-[#1A1A1A] text-white rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={
                            <span className="text-black font-bold text-base">Password</span>
                        }
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password
                            placeholder="E.g: 1917"
                            className="bg-[#1A1A1A] text-white rounded-md"
                        />
                    </Form.Item>

                    <div className="mb-4 text-sm">
                        <Link
                            href="/login"
                            className="text-blue-600 hover:underline"
                        >
                            Already have an account? Login here!
                        </Link>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full bg-black text-white text-lg hover:bg-gray-800"
                        >
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Registration;
