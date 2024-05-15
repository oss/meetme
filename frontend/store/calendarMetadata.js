import { create } from 'zustand';
import socket from '../socket';
import userData from './userStore';

const useStore = create(set => {

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

    const addCalendar = (calendarID) => {
        set((previous_state) => {
            const calJSON = { ...previous_state.calendarMetadata };
            if(calendarID in calJSON)
                return previous_state

            calJSON[calendarID] = {}
            calJSON[calendarID].isLoaded = false
            fetchCalendarMetadata(calendarID)
            return {
                calendarMetadata: calJSON
            }
        })
    }

    return {
        listenForUpdates: listenForUpdates,
        stopListeningForUpdates: stopListeningForUpdates,
        addCalendar: addCalendar,
        fetchCalendarMetadata: fetchCalendarMetadata,
        calendarMetadata: {}
    }
})

export default useStore;