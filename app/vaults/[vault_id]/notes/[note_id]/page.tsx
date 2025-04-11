"use client";
import "@ant-design/v5-patch-for-react-19";
import React from "react";


const Editor: React.FC = () => {
    return (
        <div style={{display: "flex", gap: "2rem", padding: "2rem"}}>
            <h1 className={"font-bold text-black text-3xl"}>
                this is where the editor should be
            </h1>
        </div>
    );
};

export default Editor;