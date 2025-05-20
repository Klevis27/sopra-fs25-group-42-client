"use client";

import NoteGraph from "@/components/NoteGraph";

const TestGraphPage = () => {
    return (
        <div style={{ height: "100vh", backgroundColor: "#1a1a1a", color: "white" }}>
            <h1 style={{ textAlign: "center", margin: "20px 0" }}>Graph Visualization Test</h1>
            <div style={{ height: "90%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <NoteGraph />
            </div>
        </div>
    );
};

export default TestGraphPage;
