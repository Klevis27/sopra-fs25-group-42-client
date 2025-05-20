// "use client";
// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { NoteLink } from "@/types/noteLink";
// import { Note } from "@/types/note";
// import { useApi } from "@/hooks/useApi";
// import { useParams } from "next/navigation";

// const ForceGraph2D = dynamic(
//     () => import("react-force-graph-2d"),
//     { ssr: false } 
// );

// interface Node {
//     id: string;
//     title: string;
// }

// interface Link {
//     source: string;
//     target: string;
// }

// interface GraphData {
//     nodes: Node[];
//     links: Link[];
// }

// interface NoteGraphProps {
//     graphData?: GraphData;// maybe not needed
// }


// const NoteGraph: React.FC<NoteGraphProps> = ({ }: NoteGraphProps) => {

//     const apiService = useApi();
//         const [notesArray, setNotes] = useState<Node[]>([]);
//         const [linksArray, setLinks] = useState<Link[]>([]);
//         const params = useParams<{ [key: string]: string }>();
//         const vaultId = params.vault_id;
    
//         const existsLink = false;

//         useEffect(() => {
//             const getAllLinks = async () => {
//                 const response = await apiService.get<NoteLink[]>(`/vaults/${vaultId}/note_links`);
//                 setLinks(() => []);

//                 response.forEach(element => {

//                     const sourceNoteId = element.sourceNoteId;
//                     const targetNoteId = element.targetNoteId;

//                     const sourceExists = notesArray.some(note => note.id === sourceNoteId);
//                     const targetExists = notesArray.some(note => note.id === targetNoteId);


//                     if (!sourceExists || !targetExists) {
//                         return;
//                     }

//                     if (existsLink){
//                         return;
//                     }

//                     if (element.sourceNoteId != null && element.targetNoteId != null) {
//                         const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }


//                         setLinks((prevLinks) => [...prevLinks, link]);            }
//                 });
//             }
//             if (notesArray.length > 0) {
//                 getAllLinks();
//             }
//         }, [notesArray, apiService, existsLink]);
//     useEffect(() => {
//         const getAllNotes = async () => {
//             const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`);
//             const uniqueNotes = response.reduce((acc, element) => {
//                 if (element.id && element.title) {
//                     const noteExists = acc.some(n => n.id === element.id);
//                     if (!noteExists) {
//                         acc.push({ id: element.id, title: element.title });
//                     }
//                 }
//                 return acc;
//             }, [] as Node[]);

//             setNotes(uniqueNotes);
//         };
//         getAllNotes();
//     }, [apiService]);
// /*            useEffect(() => {
//                 const getAllNotes = async () => {
//                     //TODO: Right now the vault_id is hardcoded to be 1, because
//                     //this is just the component which I didn't implement for any specific URL
//                     const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`)
//                     notesArray.forEach(element => {
//                         console.log(`Note: ${element}`)
//                     });
//                     for (const element of response) {
//                         if (element.id != null && element.title != null) {
//                             const note: Node = { id: element.id, title: element.title };

//                             const noteExists = notesArray.some(n => n.id === note.id);

//                             if (noteExists) {
//                                 console.log(`Note: ${note.title} is already in the list`);
//                                 continue;
//                             }
//                             setNotes((prevNotes) => [...prevNotes, note]);
//                         }
//                     }
//                 }
//                 getAllNotes();
//             }, [apiService, notesArray]); */
//     return (
//         <ForceGraph2D
//             graphData={{
//                 nodes: notesArray,
//                 links: linksArray
//             }}
//             nodeAutoColorBy="id"
//             linkDirectionalParticles={2}
//             linkDirectionalArrowLength={2}
//             onNodeClick={(node) => alert(`Clicked on: ${node.id}`)}
//             backgroundColor="black"
//             linkColor={() => "white"}
//             nodeCanvasObjectMode={() => 'after'}
//             nodeCanvasObject={(node, ctx, globalScale) => {
//                 const label = String((node as Node).title ?? "");
//                 const fontSize = 12 / globalScale;
//                 ctx.font = `${fontSize}px Sans-Serif`;
//                 ctx.fillStyle = "white";
//                 ctx.textAlign = "center";
//                 ctx.textBaseline = "top";
//                 ctx.fillText(label, node.x!, node.y! + 5); 
//             }
//             }
//         />
//     );
// };

// export default NoteGraph;

"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { NoteLink } from "@/types/noteLink";
import { Note } from "@/types/note";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";

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
    graphData?: GraphData;
}

const NoteGraph: React.FC<NoteGraphProps> = ({ }: NoteGraphProps) => {
    const apiService = useApi();
    const [notesArray, setNotes] = useState<Node[]>([]);
    const [linksArray, setLinks] = useState<Link[]>([]);
    const params = useParams<{ [key: string]: string }>();
    const vaultId = params.vault_id;
    const existsLink = false;
    const fgRef = useRef<any>(null); // ONLY ADDED THIS LINE

    useEffect(() => {
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

                if (existsLink){
                    return;
                }

                if (element.sourceNoteId != null && element.targetNoteId != null) {
                    const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }
                    setLinks((prevLinks) => [...prevLinks, link]);            }
                });
            }
            if (notesArray.length > 0) {
                getAllLinks();
            }
        }, [notesArray, apiService, existsLink]);

    useEffect(() => {
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
        getAllNotes();
    }, [apiService]);

    // ONLY ADDED THIS EFFECT
    useEffect(() => {
        if (notesArray.length > 0) {
            setTimeout(() => {
                fgRef.current.zoomToFit(400, 50);
            }, 100);
        }
    }, [notesArray, linksArray]);

    return (
        <ForceGraph2D
            ref={fgRef} // ONLY ADDED THIS PROP
            graphData={{
                nodes: notesArray,
                links: linksArray
            }}
            nodeAutoColorBy="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={2}
            onNodeClick={(node) => alert(`Clicked on: ${node.id}`)}
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
            }}
        />
    );
};

export default NoteGraph;

