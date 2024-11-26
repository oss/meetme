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


    const fetchGoogleData = async (calendarID, start, end) => {

        const time = new Date(start).toISOString()
        const time2 = new Date(end ).toISOString()
    
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
        set(
            produce((prevState) => {
                if (calendarID in prevState.googleData) {


                    return;
                }

                prevState.googleData[calendarID] = {
                    isLoaded: false,
                    error: false,
                    data: {},
                };
            }),
        );

    };




    return {
        fetchGoogleEmail: fetchGoogleEmail,
        fetchGoogleData:fetchGoogleData,
        addGoogleCalendar:addGoogleCalendar,
        googleEmail:"",
        googleData:{},
    }
})

export default useStore;