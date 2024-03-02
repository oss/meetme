import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import Cookies from 'js-cookie';

const useStore = create(subscribeWithSelector((set) => {
    const validateWhoamiStatus = async () => {
        const resp = await fetch(process.env.API_URL + '/whoami', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();
        if(resp_json.Status === 'ok' ){
            const loginHeartBeat = new Worker(new URL("../web_workers/worker.js", import.meta.url));
            loginHeartBeat.addEventListener("message",(e)=>{
                if(e === false)
                    set ( state => ({
                        ...state,
                        isLoggedIn: false
                    }))
            });

            set( state => ({
                isLoggedIn: true,
                userData: resp_json
            }))
        }
        else {
            Cookies.remove('session', { domain: '.localhost.edu' });
            Cookies.remove('session.sig', { domain: '.localhost.edu' });
        }
    }

    if (Cookies.get('session') !== undefined || Cookies.get('session.sig') !== undefined){
        validateWhoamiStatus()
    }

    return {
        isLoggedIn: false,
        userData: null,
    }
}))

export default useStore;