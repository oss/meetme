import { create } from 'zustand';

const buttonMenuBridge = create((set) => ({
    openMenuIdx: -1,
    setOpenMenuIdx: (idx) => set((state) => {
        if (state.openMenuIdx === idx)
            return { openMenuIdx: -1 }
        return { openMenuIdx: idx }
    }),
}));

export { buttonMenuBridge }