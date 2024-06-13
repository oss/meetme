import { create } from 'zustand';
import socket from '../socket';
import userData from './userStore';

const listenJSON = {}
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

    socket.on('user_time_updated', (calendarID)=>{
        console.log(calendarID,'bbb')
        console.log('updating '+calendarID)
        fetchCalendarMaindata(calendarID)
    });

    return {
        fetchCalendarMaindata: fetchCalendarMaindata,
        listenForUpdates: listenForUpdates,
        stopListenForUpdates: stopListenForUpdates,
        addCalendar: addCalendar,
        calendarData: {}
    }
})

export default useStore;