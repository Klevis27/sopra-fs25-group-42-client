import { create } from 'zustand';

interface PageTitleStore {
    pageTitles: string[];
    setPageTitles: (titles: string[]) => void;
}

export const usePageTitleStore = create<PageTitleStore>((set) => ({
    pageTitles: [],
    setPageTitles: (titles) => set({ pageTitles: titles }),
}));
