"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NoteLink } from "@/types/noteLink";
import { Note } from "@/types/note";
import { useApi } from "@/hooks/useApi";

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d"),
    { ssr: false } // Disable SSR
);

interface Node {
    id: string;
    title: string;
}

interface Link {
    source: string;
    target: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

interface NoteGraphProps {
    graphData: GraphData;
}


const NoteGraph: React.FC<NoteGraphProps> = ({ graphData }: NoteGraphProps) => {

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
                
    return (
        <ForceGraph2D
            graphData={graphData}
            nodeAutoColorBy="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={5}
            onNodeClick={(node) => alert(`Clicked on: ${node.id}`)}
            width={500}
            height={500}
            backgroundColor="gray"
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = String((node as Node).title ?? "");
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(label, node.x!, node.y! + 5); // Draw label below node
            }
            }
        />
    );
};

export default NoteGraph;

