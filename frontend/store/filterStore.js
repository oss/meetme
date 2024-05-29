import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(subscribeWithSelector((set) => {
    const setFilter = (filter) => {
        set( state => ({
            filter: filter,
        }))
    }

    const setAscending = (ascending) => {
        set( state => ({
            ascending: ascending,
        }))
    }


    return {
        setFilter: setFilter,
        setAscending:setAscending,
        filter: "Time Created",
        ascending: false,
    }
}))

export default useStore;