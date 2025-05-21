"use client";
import { useApi } from "@/hooks/useApi";
import { Note } from "@/types/note";
import { NoteLink } from "@/types/noteLink";
import { link } from "fs";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface LinkCreatorProps {
    text: string;
}

interface Link {
    source: string;
    target: string;
}

interface Node {
    id: string;
    title: string;
}

export const LinkCreator = ({ text }: LinkCreatorProps) => {
    const apiService = useApi();

    const params = useParams<{ [key: string]: string }>();
    const vaultId = params.vault_id;
    const noteId = params.note_id as string;

    const [notesArray, setNotes] = useState<Node[]>([]);
    const [referencedTitles, setRef] = useState<Node[]>([]);
    const [linksArray, setLinks] = useState<Link[]>([]);
    const [inNoteLinks, setInNoteLinks] = useState<string[]>([]);

    const [linksToDelete, setToDelete] = useState<Link[]>([]);
    const [linksToCreate, setToCreate] = useState<Link[]>([]);

    const existsLink = false;
    const [notesLoaded, setNotesLoaded] = useState(false);
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
            const newLinks: Link[] = [];
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



    //--------------------Don't touch this-----------------------------------//
    useEffect(() => {
        const matches = text.matchAll(/\[\[(.*?)\]\]/g);
        const links = Array.from(matches, (m) => m[1]);
        setInNoteLinks(links);



        //Filter fetched links so only those which go out from this note are left
        const filteredLinks = linksArray.filter(l => l.source.toString() == noteId);

        //From all the notes in the vault, filter out the ones that are referenced here
        const referencedNotes: Node[] = []
        links.forEach(element => {
            const reference = notesArray.find(n => n.title == element);
            if (reference) {
                referencedNotes.push(reference);
            }
        });
        setRef(referencedNotes);




        //Find all links that are referenced in the note but do not exist in the db yet
        const toCreate: Link[] = []
        referencedNotes.forEach(element => {
            const isInDb = filteredLinks.some(l => l.target == element.id);

            const newLink = {
                source: noteId,
                target: element.id
            }

            if (!isInDb) {
                toCreate.push(newLink);
            }
        });
        setToCreate(toCreate);

    }, [text, linksArray, notesArray]);
    //--------------------Don't touch this-----------------------------------//





    //For debugging only 
    useEffect(() => {
        console.log("Updated state:", inNoteLinks);
    }, [inNoteLinks]);


    //Handle the posting of new links
    useEffect(() => {
        linksToCreate.forEach(element => {
            console.log(`Link to ${element.target} will be created`);
        });
    }, [linksToCreate]);

    useEffect(() => {
        const postLinks = async () => {
            for (const element of linksToCreate) {
                try {
                    await apiService.post(`/vaults/${vaultId}/note_links`, element);
                    console.log("Posted");
                } catch (err) {
                    console.error("Failed to post link:", element, err);
                }
            }
        };

        if (linksToCreate.length > 0) {
            postLinks();
        }
    }, [linksToCreate, apiService])




    return null;
};
