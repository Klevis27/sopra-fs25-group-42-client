"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { NoteLink } from "@/types/noteLink";
import { Note } from "@/types/note";
import { useApi } from "@/hooks/useApi";

const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d"),
    { ssr: false } 
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
        const [notesArray, setNotes] = useState<Node[]>([]);
        const [linksArray, setLinks] = useState<Link[]>([]);
    
        let existsLink = false;
    
          useEffect(() => {
            getAllNotes();
          }, []);

          useEffect(() => {
            if (notesArray.length > 0) {
              getAllLinks();
            }
          }, [notesArray]);
    
        const getAllNotes = async () => {
            //TODO: Right now the vault_id is hardcoded to be 1, because 
            //this is just the component which I didn't implement for any specific URL
            const response = await apiService.get<Note[]>("/vaults/1/notes")
    
            notesArray.forEach(element => {
                console.log(`Note: ${element}`)
            });
    
            for (const element of response) {
                if (element.id != null && element.title != null) {
                    const note: Node = { id: element.id, title: element.title };
    
                    const noteExists = notesArray.some(n => n.id === note.id);
    
                    if (noteExists) {
                        console.log(`Note: ${note.title} is already in the list`);
                        continue;
                    }
                    setNotes((prevNotes) => [...prevNotes, note]);
                }
            };
            
        }
    
    
        const getAllLinks = async () => {
            const response = await apiService.get<NoteLink[]>("/vaults/1/note_links");
            setLinks(() => []);
    
            response.forEach(element => {
    
                const sourceNoteId = element.sourceNoteId;
                const targetNoteId = element.targetNoteId;
    
                const sourceExists = notesArray.some(note => note.id === sourceNoteId);
                const targetExists = notesArray.some(note => note.id === targetNoteId);
    
    
                if (!sourceExists || !targetExists) {
                    return;
                }
    
                if (existsLink){
                    return;
                }
    
                if (element.sourceNoteId != null && element.targetNoteId != null) {
                    const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }
    
    
                    setLinks((prevLinks) => [...prevLinks, link]);            }
            });
        }
                
    return (
        <ForceGraph2D
            graphData={{
                nodes: notesArray,
                links: linksArray
            }}
            nodeAutoColorBy="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={2}
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
                ctx.fillText(label, node.x!, node.y! + 5); 
            }
            }
        />
    );
};

export default NoteGraph;

