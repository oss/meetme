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

    const setCalSearch = (calSearch) => {
        set( state => ({
            calSearch: calSearch,
        }))
    }

    const setOrgSearch = (orgSearch) => {
        set( state => ({
            orgSearch: orgSearch,
        }))
    }


    return {
        setOrgFilter: setOrgFilter,
        setOrgAscending:setOrgAscending,
        setCalFilter: setCalFilter,
        setCalAscending:setCalAscending,
        setSelectedIndex:setSelectedIndex,
        setCalSearch:setCalSearch,
        setOrgSearch:setOrgSearch,

        calFilter: "Time Created",
        calAscending: false,
        orgFilter: "Time Created",
        orgAscending: false,
        selectedIndex: 0,
        calSearch: "",
        orgSearch: "",
    }
}))

export default useStore;