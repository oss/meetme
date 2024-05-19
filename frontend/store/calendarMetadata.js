import { create } from 'zustand';
import socket from '../socket';
import userData from './userStore';

/*
const calendarMetadataUpdatedHandler = (calendarID) => {
    console.log('recieved update for '+calendarID)
    fetchCalendarMetadata(calendarID)
}
*/

const listenJSON = {};

const useStore = create(set => {

    const listenForUpdates = (calendarID) => {
        const waitForListen = (listenerID) =>{
            if(listenerID === calendarID){
                if( calendarID in listenJSON === false)
                    listenJSON[calendarID] = 0

                listenJSON[calendarID] += 1

                socket.off('listen',waitForListen)
            }
        }
        
        socket.emit('join cal',calendarID)
        socket.on('listen',waitForListen)
    }

    const stopListenForUpdates = (calendarID) => {
        listenJSON[calendarID] -= 1;
        if(listenJSON[calendarID] === 0)
            socket.emit('leave',calendarID);
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
                const calJSON = previous_state.calendarMetadata;

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
            const calJSON = previous_state.calendarMetadata;
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

    socket.on('calendar_metadata_updated', (calendarID)=>{
        fetchCalendarMetadata(calendarID)
    });

    return {
        listenForUpdates: listenForUpdates,
        stopListenForUpdates: stopListenForUpdates,
        addCalendar: addCalendar,
        fetchCalendarMetadata: fetchCalendarMetadata,
        calendarMetadata: {}
    }
})

export default useStore;