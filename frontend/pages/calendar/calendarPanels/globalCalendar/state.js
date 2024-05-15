import { create } from 'zustand';

const hoveredUsersStore = create((set) => ({
    hoveredUsers: new Set(),
    setHoveredUsers: (userArr) => set((state) => {
        console.log(userArr)
        return { hoveredUsers: new Set(userArr) }
    }),
}));

export { hoveredUsersStore }