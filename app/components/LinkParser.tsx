// "use client";

// import { useApi } from '@/hooks/useApi';
// import { Note } from '@/types/note';
// import { useParams } from 'next/navigation';
// import { useRouter } from 'next/router';
// import React, { useEffect, useState } from 'react';
// import { ReactNode } from "react";

// interface LinkParserProps {
//     children: ReactNode;
//     onInternalLinkClick?: (pageTitle: string) => void;
// }

// export const LinkParser = ({ children, onInternalLinkClick }: LinkParserProps) => {

//         //----------------------------------------------------Start----------------------------------------------------------//
//     const params = useParams();
//     const noteId = params?.note_id as string | undefined;
//     const vaultId = params?.vault_id as string | undefined;

//     const [hasFetched, setHasFetched] = useState(false);
//     const apiService = useApi();

//     useEffect(() => {
//         if (!vaultId || !noteId || hasFetched) return;
//         const getCurrentNoteName = async () => {
//             try {
//                 const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`);
//                 response.forEach(element => {
//                     console.log("Fetched note:", element.id);
//                 });
//                 setHasFetched(true); // ✅ Prevent repeat fetches
//                 console.log("Fetched");
//             } catch (error) {
//                 console.error("Failed to fetch notes:", error);
//             }
//         };

//         getCurrentNoteName();
//     }, [vaultId, noteId, apiService, hasFetched]);
//         //----------------------------------------------------End----------------------------------------------------------//


//         //------------------------------------------------------Start--------------------------------------------------------//
//         // console.log({
//         //     type: 'internal-link',
//         //     vaultId: vaultId,
//         //     noteId: noteId,
//         //     raw: part,
//         //     pageTitle: pageTitle
//         // });
//         //--------------------------------------------------------End------------------------------------------------------//
//     const processText = (text: string) => {
//         const parts = text.split(/(\[\[.*?\]\])/g);
//         return parts.map((part, index) => {
//             const match = part.match(/\[\[(.*?)\]\]/);
//             if (match) {
//                 const pageTitle = match[1];
//                 return (
//                     <a
//                         key={index}
//                         className="internal-link text-blue-600 hover:underline cursor-pointer"
//                         onClick={(e) => {
//                             e.preventDefault();
//                             onInternalLinkClick?.(pageTitle);
//                         }}
//                     >
//                         {pageTitle}
//                     </a>
//                 );
//             }
//             return <span key={index}>{part}</span>;
//         });
//     };


//     const processChildren = (child: ReactNode): ReactNode => {
//         if (typeof child === "string") {
//             return processText(child);
//         }
//         if (Array.isArray(child)) {
//             return child.map(processChildren);
//         }
//         return child; // Don't alter non-strings like <strong>, <code>, etc.
//     };

//     return <>{React.Children.map(children, processChildren)}</>;
// };

"use client";

import { useApi } from '@/hooks/useApi';
import { Note } from '@/types/note';
import { NoteLink } from '@/types/noteLink';
import { useParams } from 'next/navigation';
import router from 'next/router';
import { unref } from 'process';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReactNode } from "react";

interface LinkParserProps {
    children: ReactNode;
    onInternalLinkClick?: (pageTitle: string) => void;
}
interface Link {
    source: string;
    target: string;
}

interface Node {
    id: string;
    title: string;
}

export const LinkParser = ({ children, onInternalLinkClick }: LinkParserProps) => {
    const params = useParams();
    const noteId = params?.note_id as string | undefined;
    const vaultId = params?.vault_id as string | undefined;
    const apiService = useApi();

    //const [notes, setNotes] = useState<Note[]>([]);
    const [notesArray, setNotes] = useState<Node[]>([]);
    const [linksArray, setLinks] = useState<Link[]>([]);
    const [targetNote, setTargetNote] = useState<Note>();
    const [hasParsed, setHasParsed] = useState(false);
    const linkTitlesRef = useRef<Set<string>>(new Set());
    const linksToCreateRef = useRef<{ source: string; target: string; vaultId: string }[]>([]);

    const existsLink = false;

    const id = localStorage.getItem("id");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !id) {
        router.push("/login");
        return;
    }

    // Fetch notes once
    // useEffect(() => {
    //     if (!vaultId || !noteId) return;

    //     const fetchNotes = async () => {
    //         try {
    //             const response = await apiService.get<Note[]>(`/vaults/${vaultId}/notes`);
    //             setNotes(response);
    //             console.log("Fetched notes:", response.map(n => n.title));
    //         } catch (error) {
    //             console.error("Failed to fetch notes:", error);
    //         }
    //     };

    //     fetchNotes();
    // }, [vaultId, noteId, apiService]);

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

                if (existsLink) {
                    return;
                }

                if (element.sourceNoteId != null && element.targetNoteId != null) {
                    const link: Link = { source: element.sourceNoteId, target: element.targetNoteId }


                    setLinks((prevLinks) => [...prevLinks, link]);
                }
            });
        }
        if (notesArray.length > 0) {
            getAllLinks();
        }
    }, [notesArray, apiService, existsLink]);

    // Parse text and collect link titles
    const processText = (text: string) => {
        const parts = text.split(/(\[\[.*?\]\])/g);
        const linksFromCurrentNote = linksArray.filter(link => link.source.toString() === noteId);

        return parts.map((part, index) => {
            const match = part.match(/\[\[(.*?)\]\]/);
            if (match) {
                const pageTitle = match[1].trim();
                const target = notesArray.find(note => note.title === pageTitle);

                if (target) {
                    const noteLinkExists = linksFromCurrentNote.some(link => link.target === target.id);

                    // Queue link creation
                    if (!noteLinkExists) {
                        linksToCreateRef.current.push({
                            source: noteId!,
                            target: target.id,
                            vaultId: vaultId!
                        });
                    }
                }



                // Add to link title set
                linkTitlesRef.current.add(pageTitle);

                return (
                    <a
                        key={index}
                        className="internal-link text-blue-600 hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            onInternalLinkClick?.(pageTitle);
                        }}
                    >
                        {pageTitle}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const processChildren = (child: ReactNode): ReactNode => {
        if (typeof child === "string") {
            return processText(child);
        }
        if (Array.isArray(child)) {
            return child.map(processChildren);
        }
        return child;
    };

    // After first render with children parsed, compare links to notes
    // useEffect(() => {
    //     if (notes.length === 0) return;

    //     const linkTitles = Array.from(linkTitlesRef.current);
    //     const existingNoteTitles = new Set(notes.map(note => note.title));

    //     const missingLinks = linkTitles.filter(title => !existingNoteTitles.has(title));
    //     const existingLinks = linkTitles.filter(title => existingNoteTitles.has(title));

    //     console.log("Internal links in content:", linkTitles);
    //     console.log("✅ Existing links:", existingLinks);
    //     console.log("❌ Missing links:", missingLinks);
    // }, [notes]);


    /* useEffect(() => {
        if (notesArray.length === 0 || linksArray.length === 0) return;

        const referencedTitles = Array.from(linkTitlesRef.current);
        const referencedTitleSet = new Set(referencedTitles);

        // Map titles to their corresponding note IDs
        const titleToNoteMap = new Map(notesArray.map(note => [note.title, note.id]));

        // Convert referenced titles to a set of actual referenced note IDs
        const referencedNoteIds = new Set(
            referencedTitles
                .map(title => titleToNoteMap.get(title))
                .filter((id): id is string => !!id)
        );

        // Now identify which links from the backend are not mentioned in this note
        const linksFromCurrentNote = linksArray.filter(link => link.source.toString() === noteId);
        const unusedLinks = linksFromCurrentNote.filter(link => !referencedNoteIds.has(link.target.toString()));


        console.log("All notes in the vault:", notesArray);
        console.log("All links in the db", linksArray);
        console.log("Links where current note is source:", linksFromCurrentNote);
        console.log("📑 Referenced internal link titles in note content:", referencedTitles);
        console.log("✅ Used links (note content references):", Array.from(referencedNoteIds));
        console.log("❌ Unused note_links (not referenced in note):", unusedLinks);
    }, [notesArray, linksArray]); */

    const parsed = useMemo(() => {
        const processed = React.Children.map(children, processChildren);
        setHasParsed(true);
        return processed;
    }, [children]);

    useEffect(() => {
        setHasParsed(false);
    }, [children]);


    useEffect(() => {
        const deleteUnreferencedLinks = async () => {
            if (!noteId || !vaultId || notesArray.length === 0 || linksArray.length === 0 || !hasParsed) return;

            const referencedTitles = Array.from(linkTitlesRef.current);
            const titleToNoteId = new Map(notesArray.map((note) => [note.title, note.id]));

            const referencedNoteIds = new Set(
                referencedTitles
                    .map((title) => titleToNoteId.get(title))
                    .filter((id): id is string => !!id)
            );

            const linksFromCurrentNote = linksArray.filter(link => link.source.toString() === noteId);
            const unreferencedLinks = linksFromCurrentNote.filter(
                link => !referencedNoteIds.has(link.target.toString())
            );

            console.log(`🔍 Unreferenced links:`, unreferencedLinks);

            for (const link of unreferencedLinks) {
                try {
                    await apiService.delete(
                        `/vaults/${vaultId}/${link.source}/${link.target}/note_links`
                    );
                    console.log(`🗑️ Deleted link from ${link.source} → ${link.target}`);
                } catch (error) {
                    console.error("❌ Failed to delete link", error);
                }
            }
        };

        deleteUnreferencedLinks();
    }, [notesArray, linksArray, vaultId, noteId, hasParsed]);


    useEffect(() => {
        const postLinks = async () => {
            const uniqueLinks = linksToCreateRef.current;
            linksToCreateRef.current = []; // Clear after copying

            for (const link of uniqueLinks) {
                try {
                    await apiService.post(`/vaults/${link.vaultId}/note_links`, link);
                    console.log(`✅ Created link from ${link.source} → ${link.target}`);
                } catch (error) {
                    console.error("❌ Failed to post link", error);
                }
            }
        };

        if (linksToCreateRef.current.length > 0) {
            postLinks();
        }
    }, [notesArray, linksArray]);







    return <>{React.Children.map(children, processChildren)}</>;
};
