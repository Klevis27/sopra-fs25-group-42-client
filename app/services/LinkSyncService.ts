import { Note } from '@/types/note';
import { NoteLink } from '@/types/noteLink';
import { useApi } from '@/hooks/useApi';
import { usePageTitleStore } from '@/stores/usePageTitleStore';

interface Link {
    source: string;
    target: string;
}

export class LinkSyncService {


    public updatePageTitle(titls: string[]){
        const pageTitles = usePageTitleStore(state => state.pageTitles);
        console.log(`Page titles: ${titls}`);
    }
}