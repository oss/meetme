import { useState } from "react";

import HeadlessDialogue from "../../utils/headless-dialogue";
import TextField from "../../utils/text-field";
import { getUser } from "../../../utils";
import { CalendarAPI } from "../../../api/calendar-api";


export default function FinalMeetingPopup({
    setIsOpen,
    isOpen,
    setFinalMeeting,
    calendarID
}: {
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
    setFinalMeeting:(finalMeeting:any)=>void;
    calendarID: string;
}) {

    let [startTime, setStartTime] = useState({hour:0,minute:0});
    let [endTime, setEndTime] = useState({hour:0,minute:0});
    let [date, setDate] = useState<Date>(null);

    async function setMeetingTime(){
        if(date == null){
            alert("Choose a date");
            return;
        }
        date.setHours(0,0,0,0);
        let startMilliseconds = date.getTime() + (startTime.hour*60*60*1000) + (startTime.minute*60*1000);
        let endMilliseconds = date.getTime() + (endTime.hour*60*60*1000) + (endTime.minute*60*1000);
        let data = await CalendarAPI.setFinalMeetingTime(calendarID,startMilliseconds,endMilliseconds);
        if(data.Status=="ok"){
            setFinalMeeting(data.time);
        }else{
            alert(data.Error);
        }
    }

    return (
        <HeadlessDialogue
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Set Meeting Time"
        >
            <div className="flex flex-col items-center">
                <div className="flex gap-x-3 w-fit items-center">
                    <p className="w-fit">Day: </p>
                    <input className="p-1 shadow bg-gray-100 rounded" type="date" onChange={(e)=>{
                        let [year, month, day] = e.target.value.split('-')
                        setDate(new Date(parseInt(year),parseInt(month)-1,parseInt(day)));
                    }}/>
                </div>
                <div className="w-fit flex gap-2 my-2">
                    <div className="flex gap-x-3 items-center">
                        <p>Start:</p>
                        <input className="p-1 shadow bg-gray-100 rounded" type="time" defaultValue={"00:00"} onChange={(e)=>{
                            let [hour,minute] = e.target.value.split(":");
                            setStartTime({hour:parseInt(hour),minute:parseInt(minute)});
                        }}/>
                    </div>
                    <div className="flex gap-x-3 items-center">
                        <p>End:</p>
                        <input className="p-1 shadow bg-gray-100 rounded" type="time" defaultValue={"00:00"} onChange={(e)=>{
                            let [hour,minute] = e.target.value.split(":");
                            setEndTime({hour:parseInt(hour),minute:parseInt(minute)});
                        }}/>
                    </div>
                </div>
                <button 
                    onClick={()=>{ setMeetingTime(); setIsOpen(false);}}
                    className="bg-red-500 hover:bg-red-600 transition-all 
                                ease-linear px-3 py-1 rounded shadow-sm text-white">Set</button>
            </div>
        </HeadlessDialogue>
    );
}
