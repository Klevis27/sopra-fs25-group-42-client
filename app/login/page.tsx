"use client"; // Disable SSR for hook usage

import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import { setCookie } from "@/utils/cookies";
import {SpinningLogo} from "@/components/Design";

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const response = await apiService.post<User>("/login", {
        username: values.username,
        password: values.password,
      });

      if (response.accessToken && response.id) {
        setCookie("accessToken", response.accessToken, 1);
        setCookie("id", response.id, 1);
        localStorage.setItem("id", response.id);
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("username", values.username);
      }

      router.push("/vaults");
    } catch {
      alert("Invalid login credentials");
      form.resetFields();
      router.push("/login");
    }
  };

  return (
      <div className="relative min-h-screen bg-[#c5eba2] text-black overflow-x-hidden">
        {/* Centered Header Logo */}
        <header className="flex justify-center pt-6">
          <SpinningLogo />
        </header>

        {/* Login Panel */}
        <div className="absolute top-0 left-[50px] w-[550px] h-screen bg-[#A0BF84]/70 p-5 flex items-center justify-center">
          <Form
              form={form}
              name="login"
              size="large"
              layout="vertical"
              requiredMark={false}
              onFinish={handleLogin}
              className="w-full"
          >
            <h1 className="text-2xl font-bold text-center text-black mb-6">
              Login
            </h1>

            <Form.Item
                name="username"
                label={<span className="text-black font-bold text-base">Username</span>}
                rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input
                  placeholder="E.g: Marx420"
                  className="bg-[#1A1A1A] text-white rounded-md"
              />
            </Form.Item>

            <Form.Item
                name="password"
                label={<span className="text-black font-bold text-base">Password</span>}
                rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                  placeholder="E.g: 1917"
                  className="bg-[#1A1A1A] text-white rounded-md"
              />
            </Form.Item>

            <div className="mb-4 text-sm">
              <Link href="/register" className="text-blue-600 hover:underline">
                Don&apos;t have an account yet? Register here!
              </Link>
            </div>

            <Form.Item>
              <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-black text-white text-lg hover:bg-gray-800"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default Login;
