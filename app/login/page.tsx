"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import {setCookie} from "@/utils/cookies";

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
      const userData = {
        username: values.username,
        password: values.password,
      };

      const response = await apiService.post<User>("/login", userData);

      // Store access and refresh token
      if (response.accessToken && response.id) {
        setCookie("accessToken", response.accessToken, 1); // Set cookie for 7 days
        setCookie("id", response.id, 1);
        localStorage.setItem("id", response.id);
        localStorage.setItem("accessToken", response.accessToken);
      }

      // Navigate to the user overview
      router.push("/vaults");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Invalid login credentials`);
      } else {
        console.error("An unknown error occurred during login.");
      }
      form.resetFields();
      router.push("/login");
    }
  };

  return (
      <div className="login-container">
        <Form
            form={form}
            name="login"
            size="large"
            variant="outlined"
            onFinish={handleLogin}
            layout="vertical"
        >
          <h1 className='centered-text'>Login</h1>
          <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
            className='input' 
            placeholder="Enter username" 
            />
          </Form.Item>
          <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input 
            className='input'
            placeholder="Enter password" 
            />
          </Form.Item>
          <Link href="/register">Don&apos;t have an account? Register here!</Link>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
  );
};

export default Login;
