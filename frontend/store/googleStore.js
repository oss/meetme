import { create } from 'zustand';

const useStore = create(set => {

    const fetchGoogleVerified= async () => {

        const resp = await fetch(process.env.API_URL + `/user/google_verified`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();

        if (resp_json.Status === 'ok') {
            set( state => ({
                googleVerified: resp_json.verified,
            }))
        }
    }




    return {
        fetchGoogleVerified: fetchGoogleVerified,
        googleVerified:false
    }
})

export default useStore;