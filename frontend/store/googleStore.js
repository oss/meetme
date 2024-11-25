import { create } from 'zustand';
import { produce } from "immer";

const useStore = create(set => {

    const fetchGoogleEmail= async () => {

        const resp = await fetch(process.env.API_URL + `/user/google_email`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();

        if (resp_json.Status === 'ok') {
            set( state => ({
                googleEmail:resp_json.email
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

    const fetchGoogleData = async (calendarID) => {
        const time = new Date().toISOString()
        const time2 = new Date(Date.now() + 48 * (60 * 60 * 1000) ).toISOString()


        const resp = await fetch(`${process.env.API_URL}/user/google_cal_dates`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    minTime:time,
                    maxTime:time2,
                })
            },
        );
        const resp_json = await resp.json();
        if(resp_json.Status === 'ok'){
            const googlestartend = resp_json.data.items.map((object, i) => {
                const startDate = new Date(object.start.dateTime).valueOf();
                const endDate = new Date(object.end.dateTime).valueOf();
                return {start: startDate,  end: endDate};
            })
        
            console.log("FETCH")
            console.log(googlestartend)
        
            const googleCals = [{_id: "netid1", times:googlestartend}]

            set(
                produce((prevState) => {
                    prevState.googleData[calendarID] = {
                        isLoaded: true,
                        error: false,
                        data: googleCals,
                    };
                }),
            );
        }
    };

    const addGoogleCalendar = async (calendarID) => {
        let shouldFetch = true;

        set(
            produce((prevState) => {
                if (calendarID in prevState.googleData) {
                    shouldFetch = false;
                    return;
                }

                prevState.googleData[calendarID] = {
                    isLoaded: false,
                    error: false,
                    data: {},
                };
            }),
        );

        if (!shouldFetch) return;
        fetchGoogleData(calendarID);
    };




    return {
        fetchGoogleEmail: fetchGoogleEmail,
        setGoogleCal:setGoogleCal,
        fetchGoogleData:fetchGoogleData,
        addGoogleCalendar:addGoogleCalendar,
        googleEmail:"",
        googleCal:[],
        googleData:{},
    }
})

export default useStore;