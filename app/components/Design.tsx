"use client"

import Image from "next/image";

export const SpinningLogo = () =>{
    return <div className="animate-spin-slow flex justify-center items-center mb-14">
        <a href={"/"}>
            <Image
                src="/logo.png"
                alt="Logo"
                width={300}
                height={300}
                className="object-contain"
            />
        </a>
    </div>
}

export const LogoText = () =>{
    return <div>
        <Image
            src="/text.png"
            alt="NMD Text"
            width={200}
            height={100}
        />
    </div>
}