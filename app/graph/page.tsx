"use client";
import React, { useState } from "react";
import NoteGraph from "@/components/NoteGraph";
import styles from "@/styles/page.module.css";
import { Button, Form, Input } from "antd";

interface Node {
    id: string;
}

interface Link {
    source: string;
    target: string;
}





const GraphPage: React.FC = () => {
    // Define the dummy graph data
    const note1 = { id: "Note1" };
    const note2 = { id: "Note2" };
    const link1 = { source: "Note1", target: "Note2" };
    const link2 = { source: "Note2", target: "Note1" };

    const [dummyNotes, setDummyNotes] = useState<Node[]>([]);
    const [dummyLinks, setDummyLinks] = useState<Link[]>([]);

    const createNewDummyNote = (value: Node) => {
        const note: Node = { id: value.id };
        setDummyNotes((prevNotes) => [...prevNotes, note]);
        console.log("Added note:", note);
        dummyNotes.forEach(element => {
            console.log(element)
        });
    };
    
    const linkDummyNotes = (values: Link) => {
        const sourceNote: Node = {id: values.source};
        const targetNote: Node = {id: values.target};
    
        console.log(`Trying to link notes: ${sourceNote} and ${targetNote}`)
    
        const sourceExists = dummyNotes.some(note => note.id === sourceNote.id);
        const targetExists = dummyNotes.some(note => note.id === targetNote.id);
    
        if (sourceExists && targetExists) {
            console.log(`Found notes: ${sourceNote} and ${targetNote}`);
            const link: Link = { source: values.source, target: values.target };
            setDummyLinks((prevLinks) => [...prevLinks, link]);

    
            dummyLinks.push(link);
        }
    
    }

    const [form] = Form.useForm();
    const [linkForm] = Form.useForm();

    const graphData = {
        nodes: dummyNotes,
        links: dummyLinks,
    };

    return (
        <div>
            <div
                className={styles.dummyNoteForm}>
                <div className="login-container">
                    <Form
                        form={form}
                        onFinish={createNewDummyNote}
                        size="large"
                        variant="outlined"
                        layout="vertical"
                        requiredMark={false}>
                        <Form.Item
                            name="id"
                            label={<span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>Enter Note Name</span>}>

                            <Input>

                            </Input>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Add Note
                            </Button>
                        </Form.Item>
                    </Form>

                    <Form
                        form={linkForm}
                        onFinish={linkDummyNotes}
                        size="large"
                        variant="outlined"
                        layout="vertical"
                        requiredMark={false}>

                        <Form.Item
                            name="source"
                            label={<span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>Source Note</span>}>

                            <Input>

                            </Input>
                        </Form.Item>

                        <Form.Item
                            name="target"
                            label={<span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>Target Note</span>}>

                            <Input>

                            </Input>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Link Notes
                            </Button>
                        </Form.Item>
                    </Form>
                </div>

                <div>

                </div>
            </div>
            <div className={styles.loginHeader}
                style={{ alignContent: "center", alignItems: "center" }}>
                <h1 style={{ color: "black", alignContent: "center" }}>Graph Visualization</h1>
            </div>
            <div className={styles.graphWindowWrapper}>
                <NoteGraph graphData={graphData} /> {/* Use the NoteGraph component */}
            </div>

        </div>
    );
};




export default GraphPage;