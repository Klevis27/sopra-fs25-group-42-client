"use client";
import { useApi } from "@/hooks/useApi";
import { Note } from "@/types/note";
import { NoteLink } from "@/types/noteLink";
import { link } from "fs";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { refreshStore } from "@/stores/refreshStore";

interface LinkExtractorProps {
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

export const LinkExtractor = ({ text }: LinkExtractorProps) => {
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
    useEffect(() => {
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



        //Find all links to delete; They are not in referencedTitles and they are in filteredLinks
        const toDelete: Link[] = [];
        filteredLinks.forEach(element => {
            const isReferenced = referencedNotes.some(t => t.id == element.target);

            if (!isReferenced) {
                toDelete.push(element);
            }
        });
        setToDelete(toDelete);



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

    }, [text]);

    //Handle the deleting of links
    useEffect(() => {
        const deleteLinks = async () => {
            for (const element of linksToDelete) {
                try {
                    await apiService.delete(`/vaults/${vaultId}/${element.source}/${element.target}/note_links`);
                    getAllNotes();
                    getAllLinks();
                    refreshStore.refresh();
                } catch (err) {
                    console.error("Failed to delete link:", element, err);
                }
            }
        };

        if (linksToDelete.length > 0) {
            deleteLinks();
        }
    }, [linksToDelete, apiService]);


    //Handle the posting of new links
    useEffect(() => {
        const postLinks = async () => {
            for (const element of linksToCreate) {
                try {
                    await apiService.post(`/vaults/${vaultId}/note_links`, element);
                    getAllNotes();
                    getAllLinks();
                    refreshStore.refresh();
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
