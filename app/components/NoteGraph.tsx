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
            width={600}
            height={600}
            backgroundColor="white"
        />
    );
};

export default NoteGraph;

