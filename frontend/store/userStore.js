import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import socket from '../socket';
import authStore from './authStore';

const useStore = create(subscribeWithSelector((set) => {
    const authStatus = authStore.subscribe((state)=> state.calendars,(arr)=>{
        getUserData()
    })

    const getUserData = async () => {
        const resp = await fetch(process.env.API_URL + '/user/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();
        if(resp_json.Status === 'ok' ){
            set ( state => ({
                ...resp_json.data
            }))
        }
    }

    getUserData()
    socket.on("pending_invitation_update", getUserData);

    return {}
}))

export default useStore;