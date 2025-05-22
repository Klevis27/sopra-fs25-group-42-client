"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { NoteLink } from "@/types/noteLink";
import { Note } from "@/types/note";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";
import { refreshStore } from "@/stores/refreshStore";

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
    graphData?: GraphData;// maybe not needed
}


const NoteGraph: React.FC<NoteGraphProps> = ({ }: NoteGraphProps) => {

    const apiService = useApi();
    const [notesArray, setNotes] = useState<Node[]>([]);
    const [linksArray, setLinks] = useState<Link[]>([]);
    const params = useParams<{ [key: string]: string }>();
    const vaultId = params.vault_id;
    const fgRef = useRef<any>(null);

    const existsLink = false;

    const getAllLinks = async () => {
        const response = await apiService.get<NoteLink[]>(`/vaults/${vaultId}/note_links`);
        setLinks(() => []);

        response.forEach(element => {

            const sourceNoteId = element.sourceNoteId;
            const targetNoteId = element.targetNoteId;

            const sourceExists = notesArray.some(note => note.id === sourceNoteId);
            const targetExists = notesArray.some(note => note.id === targetNoteId);


            if (!sourceExists || !targetExists) {
                return;
            }

            if (existsLink) {
                return;
            }

            if (element.sourceNoteId != null && element.targetNoteId != null) {
                const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }


                setLinks((prevLinks) => [...prevLinks, link]);
            }
        });
    }
    useEffect(() => {
        if (notesArray.length > 0) {
            getAllLinks();
        }
    }, [notesArray, apiService, existsLink]);

    const getAllNotes = async () => {
        const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`);
        const uniqueNotes = response.reduce((acc, element) => {
            if (element.id && element.title) {
                const noteExists = acc.some(n => n.id === element.id);
                if (!noteExists) {
                    acc.push({ id: element.id, title: element.title });
                }
            }
            return acc;
        }, [] as Node[]);

        setNotes(uniqueNotes);
    };

    useEffect(() => {
        getAllNotes();
    }, [apiService]);



    useEffect(() => {
        const onRefresh = () => {
            getAllNotes();
            getAllLinks();
        }
        const unsubscribe = refreshStore.subscribe(onRefresh);

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (notesArray.length > 0) {
            setTimeout(() => {
                fgRef.current.zoomToFit(100, 100);
            }, 1000);
        }
    }, [notesArray, linksArray]);
    return (
        <ForceGraph2D
            ref={fgRef}
            graphData={{
                nodes: notesArray,
                links: linksArray
            }}
            nodeAutoColorBy="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={2}
            onNodeClick={(node) => alert(`Clicked on: ${node.id}`)}
            backgroundColor="black"
            linkColor={() => "white"}
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = String((node as Node).title ?? "");
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(label, node.x!, node.y! + 5);
            }
            }
            width={300}
            height={300}
        />
    );
};

export default NoteGraph;
