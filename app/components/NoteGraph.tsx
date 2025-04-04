"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(
    () => import("react-force-graph-2d"),
    { ssr: false } // Disable SSR
);

interface Node {
    id: string;
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

const note1: Node = { id: "Note1" };
const note2: Node = { id: "Note2" };
const link1: Link = { source: "Note1", target: "Note2" };
const link2: Link = { source: "Note2", target: "Note1" };
let notes = [note1, note2]
let links = [link1, link2]
const data: GraphData = { nodes: notes, links: links }

const NoteGraph: React.FC<NoteGraphProps> = ({ graphData }: NoteGraphProps) => {
    return (
        <ForceGraph2D
            graphData={graphData}
            nodeAutoColorBy="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={5}
            onNodeClick={(node) => alert(`Clicked on: ${node.id}`)}
            width={1000}
            height={1000}
            backgroundColor="gray"
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = String(node.id ?? "");
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

