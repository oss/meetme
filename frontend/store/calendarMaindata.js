import { create } from 'zustand';
import socket from '../socket';
import userData from './userStore';

const useStore = create(set => {
    const unsub1 = userData.subscribe((state) => state.calendars, (arr) => {
        updateCalendarJSON()
    })

    const fetchCalendarMaindata = async (calendarID) => {

        const resp = await fetch(process.env.API_URL + `/cal/${calendarID}/main`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();

        if (resp_json.Status === 'ok') {
            set((previous_state) => {
                const calJSON = { ...previous_state.calendarData };
                    
                calJSON[calendarID].isLoaded = true
                calJSON[calendarID].data = resp_json.maindata
                return {
                    calendarData: calJSON
                }
            })
        }
    }

    const addCalendar = (calendarID) => {
        set((previous_state) => {
            const calJSON = { ...previous_state.calendarData };
            if(calendarID in calJSON)
                return previous_state
                
            calJSON[calendarID] = {}
            calJSON[calendarID].isLoaded = false
            fetchCalendarMaindata(calendarID)
            return {
                calendarData: calJSON
            }
        })
        
    }

    return {
        fetchCalendarMaindata: fetchCalendarMaindata,
        addCalendar: addCalendar,
        calendarData: {}
    }
})

export default useStore;