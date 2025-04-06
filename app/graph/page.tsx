"use client";
import React, { useEffect, useState } from "react";
import NoteGraph from "@/components/NoteGraph";
import styles from "@/styles/page.module.css";
import "@ant-design/v5-patch-for-react-19";
import { Button, Form, Input, Select } from "antd";
import { Note } from "@/types/note";
import { NoteLink } from "@/types/noteLink";
import { ApiService } from "@/api/apiService";
import { useApi } from "@/hooks/useApi";



interface Node {
    id: string;
    title: string;
}

interface Link {
    source: string;
    target: string;
}





const GraphPage: React.FC = () => {
    const apiService = useApi();
    const [dummyNotes, setDummyNotes] = useState<Node[]>([]);
    const [dummyLinks, setDummyLinks] = useState<Link[]>([]);
    const [tempLinks, setTempLinks] = useState<Link[]>([]);

    let existsLink = false;

    useEffect(() => {
        if (tempLinks.length > 0) {
          const link = tempLinks[0];
          const exists = dummyLinks.some(
            (l) => l.source === link.source && l.target === link.target
          );
          if (exists) {
            console.log("Link exists");
            existsLink = true;
          } else {
            existsLink = false;
          }
        }
      }, [tempLinks, dummyLinks]);

    const getAllNotes = async () => {
        const response = await apiService.get<Note[]>("/vaults/1/notes")

        dummyNotes.forEach(element => {
            console.log(`Note: ${element}`)
        });

        for (const element of response) {
            if (element.id != null && element.title != null) {
                const note: Node = { id: element.id, title: element.title };

                const noteExists = dummyNotes.some(n => n.id === note.id);

                if (noteExists) {
                    console.log(`Note: ${note.title} is already in the list`);
                    continue;
                }
                setDummyNotes((prevNotes) => [...prevNotes, note]);
            }
            console.log(`Note id: ${element.id}, Note title: ${element.title}`);
        };
        
        getAllLinks();
    }




    const getAllLinks = async () => {
        const response = await apiService.get<NoteLink[]>("/vaults/1/note_links");
        setDummyLinks(() => []);

        response.forEach(element => {

            const sourceNoteId = element.sourceNoteId;
            const targetNoteId = element.targetNoteId;



            const sourceExists = dummyNotes.some(note => note.id === sourceNoteId);
            const targetExists = dummyNotes.some(note => note.id === targetNoteId);

            const sourceInArray = dummyLinks.some(l => l.source === element.sourceNoteId);


            if (!sourceExists || !targetExists) {
                return;
            }

            if (existsLink){
                return;
            }

            if (element.sourceNoteId != null && element.targetNoteId != null) {
                const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }


                setDummyLinks((prevLinks) => [...prevLinks, link]);            }
            console.log(`Source Note: ${element.sourceNoteId}, Target Note: ${element.targetNoteId}`)
        });
    }

    const graphData = {
        nodes: dummyNotes,
        links: dummyLinks,
    };

    return (
        <div>
            <div
                className={styles.dummyNoteForm}>
                <div className="login-container">
                    <Button type="primary" htmlType="submit" onClick={getAllNotes}>
                        Get All Notes
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={getAllLinks}>
                        Get All Links
                    </Button>
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