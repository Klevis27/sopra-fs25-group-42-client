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
            // Call the API service and let it handle JSON serialization and error handling
            const userData = {
                username: values.username,
                password: values.password,
            };
            const response = await apiService.post<User>("/users", userData);

            // Store access and refresh token
            if (response.accessToken && response.id) {
                setCookie("accessToken", response.accessToken, 1); // Set cookie for 1 days
                setCookie("id", response.id, 1);
                localStorage.setItem("id", response.id);
                localStorage.setItem("accessToken", response.accessToken);
            }
            // Navigate to the user overview
            router.push("/vaults");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`Username already taken`);
            } else {
                // Handle unknown error
                console.error("An unknown error occurred during registration.");
                alert("An unknown error occurred.");
            }
            form.resetFields();
            router.push("/register");
        }
    };

    return (

        <div className={styles.page}>

            <header>
                <div className={styles.logoWrapper}>
                    <Image
                        src="/logo.png"
                        alt="NMD Logo"
                        style={{ width: "400px", height: "auto" }}
                    />
                </div>
            </header>

            <main className={styles.registrationWrapper}>

                <title>Registration</title>
                <div className="login-container">
                    <Form
                        form={form}
                        name="signup"
                        size="large"
                        variant="outlined"
                        onFinish={handleRegistration}
                        layout="vertical"
                        requiredMark={false}
                    >
                        <h1 className='centered-text'>Register</h1>
                        <Form.Item
                            name="username"
                            label={<span style={{ color: "black", fontWeight: "bold", fontSize: "16px" }}>Username</span>}
                            rules={[{ required: true, message: "Please input your username!" }]}
                        >
                            <Input
                                className='input'
                                placeholder="E.g: Marx420"
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
                            />
                        </Form.Item>
                        <Link href="/login">Already have an account? Login here!</Link>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-button"
                            style={{color: 'white', backgroundColor: 'black', fontSize: 20}}>
                                Register
                            </Button>
                        </Form.Item>
                    </Form>
                </div>



            </main>
        </div>





        /*<>
            <title>Registration</title>
            <div className="login-container">
                <Form
                    form={form}
                    name="signup"
                    size="large"
                    variant="outlined"
                    onFinish={handleRegistration}
                    layout="vertical"
                >
                    <h1>Register</h1>
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{required: true, message: "Please input your username!"}]}
                    >
                        <Input placeholder="Enter username"/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{required: true, message: "Please input your password!"}]}
                    >
                        <Input placeholder="Enter password"/>
                    </Form.Item>
                    <Link href="/login">Already have an account? Login here!</Link>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button">
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>*/
    );
};

export default Registration;
