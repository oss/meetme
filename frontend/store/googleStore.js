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

    const setGoogleCal = async () => {
        const time = new Date().toISOString()
        const time2 = new Date(Date.now() + 48 * (60 * 60 * 1000) ).toISOString()
    
        let data2 = await fetch(`${process.env.API_URL}/user/google_cal_dates`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                minTime:time,
                maxTime:time2,
            }),
        }).then((res) => res.json());

        if (data2.Status == "error"){
            set((previous_state) => {
                return {
                    googleCal: previous_state
                }
            })
        }
        else{
            const googlestartend = data2.data.items.map((object, i) => {
                const startDate = new Date(object.start.dateTime).valueOf();
                const endDate = new Date(object.end.dateTime).valueOf();
                return {start: startDate,  end: endDate};
            })
        
            console.log(googlestartend)
        
            const googleCals = {_id: "netid1", times:googlestartend}
        
            console.log(googleCals)
    
            const arr = [googleCals]
    
            console.log(arr)
        
            set((previous_state) => {
    
                return {
                    googleCal: arr
                }
            })
        }


    }




    return {
        fetchGoogleVerified: fetchGoogleVerified,
        setGoogleCal:setGoogleCal,
        googleVerified:false,
        googleCal:[],
    }
})

export default useStore;