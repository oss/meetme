import { create } from "zustand";
import socket from "../socket";
import { produce } from "immer";

/*
const calendarMetadataUpdatedHandler = (calendarID) => {
    console.log('recieved update for '+calendarID)
    fetchCalendarMetadata(calendarID)
}
*/

const listenJSON = {};

const useStore = create((set) => {
    const listenForUpdates = (calendarID) => {
        const waitForListen = (listenerID) => {
            if (listenerID === calendarID) {
                if (calendarID in listenJSON === false)
                    listenJSON[calendarID] = 0;

                listenJSON[calendarID] += 1;

                socket.off("listen", waitForListen);
            }
        };

        socket.emit("join cal", calendarID);
        socket.on("listen", waitForListen);
    };

    const stopListenForUpdates = (calendarID) => {
        listenJSON[calendarID] -= 1;
        if (listenJSON[calendarID] === 0) socket.emit("leave", calendarID);
    };

    const fetchCalendarMetadata = async (calendarID) => {
        const resp = await fetch(process.env.API_URL + `/cal/${calendarID}/meta`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        const resp_json = await resp.json();
        if(resp_json.Status === 'ok'){
            set(
                produce((prevState) => {
                    prevState.calendarMetadata[calendarID] = {
                        isLoaded: true,
                        error: false,
                        data: resp_json.metadata,
                    };
                }),
            );
        }
    };

    const addCalendar = async (calendarID) => {
        let shouldFetch = true;

        set(
            produce((prevState) => {
                if (calendarID in prevState.calendarMetadata) {
                    shouldFetch = false;
                    return;
                }

                prevState.calendarMetadata[calendarID] = {
                    isLoaded: false,
                    error: false,
                    data: {},
                };
            }),
        );

        if (!shouldFetch) return;
        fetchCalendarMetadata(calendarID);
    };

    socket.on("calendar_metadata_updated", (calendarID) => {
        fetchCalendarMetadata(calendarID);
    });

    return {
        listenForUpdates: listenForUpdates,
        stopListenForUpdates: stopListenForUpdates,
        addCalendar: addCalendar,
        fetchCalendarMetadata: fetchCalendarMetadata,
        calendarMetadata: {},
    };
});

export default useStore;
