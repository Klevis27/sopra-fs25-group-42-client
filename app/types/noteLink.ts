import { Note } from "./note";


export interface NoteLink {
    id: string | null;
    sourceNoteId: string | null;
    targetNoteId: string | null;
}