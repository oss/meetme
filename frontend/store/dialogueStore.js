import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import Cookies from 'js-cookie';

const useStore = create(subscribeWithSelector((set) => {
    const setPanel = (panel) => {
        set( state => ({
            ...state,
            panel: panel,
            display: true
        }))
    }

    const closePanel = () => {
        set( state => ({
            ...state,
            display: false
        }))
    }

    return {
        setPanel: setPanel,
        closePanel: closePanel,
        display: false,
        panel: null,
    }
}))

export default useStore;