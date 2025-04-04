import React from "react";
import NoteGraph from "@/components/NoteGraph";
import styles from "@/styles/page.module.css";



const GraphPage: React.FC = () => {
    // Define the dummy graph data
    const note1 = { id: "Note1" };
    const note2 = { id: "Note2" };
    const link1 = { source: "Note1", target: "Note2" };
    const link2 = { source: "Note2", target: "Note1" };

    const graphData = {
        nodes: [note1, note2],
        links: [link1, link2],
    };

    return (
        <div>
            <div className={styles.loginHeader}
            style={{alignContent: "center", alignItems:"center"}}>
                <h1 style={{ color: "black", alignContent: "center" }}>Graph Visualization</h1>
            </div>
            <div className={styles.graphWindowWrapper}>
                <NoteGraph graphData={graphData} /> {/* Use the NoteGraph component */}
            </div>
        </div>
    );
};



export default GraphPage;