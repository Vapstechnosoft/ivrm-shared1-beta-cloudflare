import { create } from 'zustand';

interface GenConfigState {
    editId: number | null;
    setEditId: (id: number | null) => void;
}

export const useConfigStore = create<GenConfigState>((set) => ({
    editId: null,
    setEditId: (id) => set({ editId: id })
}));
