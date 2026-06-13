import { create } from 'zustand';

const calendarPageStore = create(set => {
    const setMemberList = (newMemberList) => set((state) => {
        return { memberList: newMemberList }
    })

    const setMemberSet = (newMemberSet) => set((state) => {
        return { memberSet: newMemberSet }
    })

    return {
        memberList: [],
        memberSet: new Set(),
        setMemberList: setMemberList,
        setMemberSet: setMemberSet
    }
});

export default calendarPageStore