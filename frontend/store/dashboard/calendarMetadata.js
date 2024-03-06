import { create } from 'zustand';
import socket from '../../socket';
import userData from '../userStore';

const calendarMetadataIndexMap = {}

const useStore = create( set => {
    const unsub1 = userData.subscribe((state)=> state.calendars,(arr)=>{
        updateCalendarList()
    })

    const recieveMsg = (abc) => {
        console.log(abc)
    }

    const keepUpdated = () => {
        updateCalendarList()
        socket.emit("dashboard");
        socket.on("custom-message", recieveMsg);
    }

    const stopUpdated = () => {
        socket.off("custom-message",recieveMsg);
    }

    //make array accesses easier, stores calid: index inside array

    const updateCalendarList = ( ) => {
        set((previous_state)=>{
            const current_calendars = userData.getState().calendars;
            const arr = [...previous_state.calendarMetadata];
            const index_map = calendarMetadataIndexMap;

            for (let i=0;i<current_calendars.length;i++){
                const cal_id = current_calendars[i]._id
                if( cal_id in index_map === false ){
                    arr.push({
                        _id: cal_id,
                        isLoaded: false
                    });
                    index_map[cal_id] = arr.length-1
                    fetchCalendarMetadata(cal_id)
                }
            }

            return {
                ...previous_state,
                calendarMetadata: arr
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

        if (resp_json.Status === 'ok'){
            set((previous_state)=>{
                const arr = [...previous_state.calendarMetadata];
                const index_map = calendarMetadataIndexMap;
    
                arr[index_map[calendarID]].isLoaded = true
                arr[index_map[calendarID]].data = resp_json.metadata
     
                return {
                    ...previous_state,
                    calendarMetadata: arr
                }
            })    
        }
    }

    return {
        functions: {
            updateCalendarList: updateCalendarList,
            keepUpdated: keepUpdated,
            stopUpdated: stopUpdated
        },
        calendarMetadata: []
    }
})

export default useStore;