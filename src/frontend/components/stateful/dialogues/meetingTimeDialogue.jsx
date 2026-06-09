import dialogueStore from '@store/dialogueStore';
import { useEffect, useState } from 'react';
import TextBarDialogue from '@ui/TextBarDialogue';

import { useRef } from 'react';
import { Dialog } from '@headlessui/react';
import RedButton from '../../utils/red-button';

function MeetingTimeDialogue({ calID }) {
    const closeDialogue = dialogueStore((store) => store.closePanel)
    const [displayError, setDisplayError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('some error message')

    const [validTime, setValidTime] = useState(true);

    function validate_time() {
        const start = startTimeRef.current.value;
        const end = endTimeRef.current.value;
        //12:00AM in ending is always ok
        setValidTime(end === '00:00' || start < end);
    }

    function setEndtoStart(){
        const start = startDateRef.current.value;
        if (endDateRef.current.value == ""){
            endDateRef.current.value = start;
        }
    }


    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    async function onClickPassthrough(event, startTimeValue, endTimeValue, startDateValue, endDateValue){

        const date_start = new Date(startTimeValue + startDateValue + (new Date().getTimezoneOffset())*60*1000);

        const date_end = new Date(endTimeValue + endDateValue + (new Date().getTimezoneOffset())*60*1000);


        const req = await fetch(`${process.env.API_URL}/cal/${calID}/meet_time`, {
            credentials: 'include', method: 'PATCH', headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                start: date_start.valueOf(),
                end: date_end.valueOf(),
})
        });
        const resp = await req.json()
        if (resp.Status === 'ok') {
            console.log(resp)
            closeDialogue()
        }
        else {
            setErrorMessage(resp.error)
            setDisplayError(true)
        }
    }


    const onClickHandler = (event) => {

        onClickPassthrough(event,startTimeRef.current.valueAsNumber,endTimeRef.current.valueAsNumber, startDateRef.current.valueAsNumber, endDateRef.current.valueAsNumber)
    }

    console.log('Meeting Time dialogue re-render')

    return (
        <div>
            <Dialog.Title>{"Set Meeting Time"}</Dialog.Title>
            <Dialog.Description>
                <p className="text-sm text-gray-500">
                    {''}
                </p>
            </Dialog.Description>
            <div className='h-1' />
            <p style={{ gridColumn: 1, gridRow: 1 }}>
                Start
            </p>
            <div style={{ gridColumn: 1, gridRow: 2 }}>
                <input  ref={startDateRef} type="date" className = "mr-2"
                    onChange={(e) => {
                        setEndtoStart();
                    }} />
                <input
                    ref={startTimeRef}
                    type="time"
                    defaultValue="09:00"
                    onChange={(e) => {
                        validate_time();
                    }}
                    step="3600000"
                />
            </div>
            <div style={{ gridColumn: 2 }}>End</div>
            <div style={{ gridColumn: 2, gridRow: 2 }}>
                <input  ref={endDateRef} type="date" className = "mr-2" />
                <input
                    ref={endTimeRef}
                    type="time"
                    defaultValue="17:00"
                    onChange={(e) => {
                        validate_time();
                    }}
                    step="3600000"
                />
            </div>
            <p className={`${validTime ? 'invisible' : ''} text-xs text-rose-600`}>
                Error: Start time occurs before end time
            </p>

            <div className='h-1' />
            <div className='inline-flex w-full'>
                <p className="grow min-w-5 text-xs text-rose-600 inline text-clip break-words">
                    {displayError ? errorMessage : <></>}
                </p>
                <div className=''>
                    <RedButton onClick={onClickHandler}>
                        {"Set Time"}
                    </RedButton>
                </div>
            </div>
        </div>
    )
}

export default MeetingTimeDialogue;