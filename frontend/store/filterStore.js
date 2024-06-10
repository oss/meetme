import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(subscribeWithSelector((set) => {
    const setOrgFilter = (orgFilter) => {
        set( state => ({
            orgFilter: orgFilter,
        }))
    }

    const setOrgAscending = (orgAscending) => {
        set( state => ({
            orgAscending: orgAscending,
        }))
    }

    const setCalFilter = (calFilter) => {
        set( state => ({
            calFilter: calFilter,
        }))
    }

    const setCalAscending = (calAscending) => {
        set( state => ({
            calAscending: calAscending,
        }))
    }

    const setSelectedIndex = (selectedIndex) => {
        set( state => ({
            selectedIndex: selectedIndex,
        }))
    }


    return {
        setOrgFilter: setOrgFilter,
        setOrgAscending:setOrgAscending,
        setCalFilter: setCalFilter,
        setCalAscending:setCalAscending,
        setSelectedIndex:setSelectedIndex,

        calFilter: "Time Created",
        calAscending: false,
        orgFilter: "Time Created",
        orgAscending: false,
        selectedIndex: 0,
    }
}))

export default useStore;