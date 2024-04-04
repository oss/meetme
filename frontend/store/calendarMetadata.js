import { create } from 'zustand';
import socket from '../socket';
import userData from './userStore';

const useStore = create(set => {
    const unsub1 = userData.subscribe((state) => state.calendars, (arr) => {
        updateCalendarJSON()
    })

    const calendarMetadataUpdatedHandler = (calendarID) => {
        fetchCalendarMetadata(calendarID)
    }

    const listenForUpdates = () => {
        const current_calendars = userData.getState().calendars;
        for(let i=0;i<current_calendars.length;i++){
            socket.emit('join cal',current_calendars[i]._id)
            socket.on('calendar_metadata_updated', calendarMetadataUpdatedHandler);
        }
    }

    const stopListeningForUpdates = () => {
        const current_calendars = userData.getState().calendars;
        for(let i=0;i<current_calendars.length;i++){
            socket.off('calendar_metadata_updated', calendarMetadataUpdatedHandler);
        }
    }

    //make array accesses easier, stores calid: index inside array

    const updateCalendarJSON = async () => {
        set((previous_state) => {
            const current_calendars = userData.getState().calendars;
            const calJSON = { ...previous_state.calendarMetadata };

            for (let i = 0; i < current_calendars.length; i++) {
                const cal_id = current_calendars[i]._id

                let downloadMetadata = false;
                if (cal_id in calJSON === false)
                    calJSON[cal_id] = { isLoaded: false }

                if(calJSON[cal_id].isLoaded === false)
                    downloadMetadata = true

                if(downloadMetadata)
                    fetchCalendarMetadata(cal_id)
            }

            return {
                calendarMetadata: calJSON
            }
        });
    }

    const fetchCalendarMetadata = async (calendarID) => {
        const resp = await fetch(process.env.API_URL + `/cal/${calendarID}/meta`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();

        if (resp_json.Status === 'ok') {
            set((previous_state) => {
                const calJSON = { ...previous_state.calendarMetadata };

                calJSON[calendarID].isLoaded = true
                calJSON[calendarID].data = resp_json.metadata
                return {
                    calendarMetadata: calJSON
                }
            })
        }
    }

    const initCalenendarMetadaJSON = () => {
        const current_calendars = userData.getState().calendars;
        const calJSON = {}

        for (let i = 0; i < current_calendars.length; i++) {
            calJSON[current_calendars[i]._id] = { isLoaded: false }
        }
        return calJSON
    }

    return {
        listenForUpdates: listenForUpdates,
        stopListeningForUpdates: stopListeningForUpdates,
        updateCalendarJSON: updateCalendarJSON,
        calendarMetadata: initCalenendarMetadaJSON()
    }
})

export default useStore;