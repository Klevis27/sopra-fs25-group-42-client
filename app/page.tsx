"use client"
import "@ant-design/v5-patch-for-react-19";
import {useRouter} from "next/navigation";
import {Button, Form} from "antd";
import {LogoText, PlaestinaFlag, SpinningLogo} from "@/components/Design";

export default function Home() {
    const router = useRouter();
    return (
        <div
            className="flex flex-col justify-center items-center min-h-screen gap-8 px-5 overflow-x-hidden bg-[#c5eba2] text-black">
            <main className="flex flex-col items-center gap-8">
                {/* NMD Text */}
                <div className="flex justify-center mb-0 h-32 w-auto">
                    <LogoText/>
                </div>

                {/* Spinning Logo */}
                <SpinningLogo/>

                {/* Promotional Text */}
                <div className="text-center flex flex-col gap-3">
                    <p className="text-xl font-bold">
                        ✨ Welcome to the Future of Collaborative Writing ✨
                    </p>
                    <p>
                        A beautifully minimal markdown editor designed for effortless, real-time teamwork.
                    </p>
                    <p>
                        No installations, no complexity — just pure collaboration.
                    </p>
                    <p className="italic">
                        Simple. Powerful. Open.
                    </p>
                    <p className="font-bold">
                        Start writing smarter — today.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button type="primary" onClick={() => router.push("/login")}>Go to login</Button>
                    <Button type="primary" onClick={() => router.push("/register")}>Go to registration</Button>
                </div>
            </main>

            {/* Footer */}
            <footer className="flex justify-center gap-6">
                <div className="flex flex-row gap-6">

                    <PlaestinaFlag/>
                </div>
            </footer>
        </div>
    );
}
