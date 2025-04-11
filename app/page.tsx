"use client";
import "@ant-design/v5-patch-for-react-19";
import {useRouter} from "next/navigation";
import {Button} from "antd";
import {BookOutlined, CodeOutlined, GlobalOutlined} from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import Image from "next/image";

export default function Home() {
    const router = useRouter();

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/* text.png - Set the NMD text width to 500px and reset marginBottom to zero */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "0px", // Removed the space between the logo and text
                    }}
                >
                    <Image
                        src="/text.png"
                        alt="NMD Text"
                        width="100"
                        height="100"
                        style={{width: "500px", height: "auto"}} // Set NMD to 500px width
                    />
                </div>

                {/* Spinning logo */}
                <div className={styles.logoWrapper}>
                    <Image
                        width="100"
                        height="100"
                        className={styles.logo}
                        src="/logo.png"
                        alt="Logo"
                    />
                </div>

                {/* Promotional Text */}
                <div
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <p style={{fontSize: "20px", fontWeight: "bold"}}>
                        ✨ Welcome to the Future of Collaborative Writing ✨
                    </p>
                    <p>
                        A beautifully minimal markdown editor designed for effortless, real-time teamwork.
                    </p>
                    <p>
                        No installations, no complexity — just pure collaboration.
                    </p>
                    <p>
                        <i>Simple. Powerful. Open.</i>
                    </p>
                    <p>
                        <b>Start writing smarter — today.</b>
                    </p>
                </div>

                {/* Buttons */}
                <div className={styles.ctas}>
                    <Button
                        type="primary"
                        onClick={() =>
                            globalThis.open(
                                "https://vercel.com/new",
                                "_blank",
                                "noopener,noreferrer"
                            )
                        }
                    >
                        Deploy now
                    </Button>
                    <Button
                        type="default"
                        onClick={() =>
                            globalThis.open(
                                "https://nextjs.org/docs",
                                "_blank",
                                "noopener,noreferrer"
                            )
                        }
                    >
                        Read our docs
                    </Button>
                    <Button type="primary" onClick={() => router.push("/login")}>
                        Go to login
                    </Button>
                    <Button type="primary" onClick={() => router.push("/register")}>
                        Go to registration
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <Button
                    type="link"
                    icon={<BookOutlined/>}
                    href="https://nextjs.org/learn"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn
                </Button>
                <Button
                    type="link"
                    icon={<CodeOutlined/>}
                    href="https://vercel.com/templates?framework=next.js"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Examples
                </Button>
                <Button
                    type="link"
                    icon={<GlobalOutlined/>}
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Go to nextjs.org →
                </Button>
            </footer>
        </div>
    );
}