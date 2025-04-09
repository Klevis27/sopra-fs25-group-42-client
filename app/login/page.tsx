"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import '@ant-design/v5-patch-for-react-19';
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import Link from "next/link";
import { setCookie } from "@/utils/cookies";
import styles from "@/styles/page.module.css";
import Image from "next/image";


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
    <div className={styles.page}>

      <header className={styles.loginHeader}>
        <div className={styles.logoWrapper}>
          <Image
              src="/logo.png"
              style={{width: "400px", height: "auto"}}
              alt={""}
          />
        </div>
      </header>

      <main className={styles.main}>
        <title>Login</title>
        <div className={styles.loginWrapper}>
          <div className="login-container">
            <Form
              form={form}
              name="login"
              size="large"
              variant="outlined"
              onFinish={handleLogin}
              layout="vertical"
              requiredMark={false}
            >
              <h1 className='centered-text'>Login</h1>
              <Form.Item
                name="username"
                label={<span style={{ color: "black", fontWeight: "bold", fontSize: "16px" }}>Username</span>}
                rules={[{ required: true, message: "Please input your username!" }]}
              >
                <Input
                  className='input'
                  placeholder="E.g: Marx420"
                  style={{ color: "white" }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                label={<span style={{ color: "black", fontWeight: "bold", fontSize: "16px" }}>Password</span>}
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input
                  className='input'
                  placeholder="E.g: 1917"
                  style={{ color: "white" }}
                />
              </Form.Item>
              <Link href="/register">Don&apos;t have an account yet? Register here!</Link>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button"
                style={{color: 'white', backgroundColor: 'black', fontSize: 20}}>
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>



      </main>
    </div>
  );
};

export default Login;

