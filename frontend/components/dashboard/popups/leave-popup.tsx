import { useState } from 'react';
import { CalendarAPI } from '../../../api/calendar-api';
import HeadlessDialogue from '../../utils/headless-dialogue';

import { popupOptions } from '../popup-manager';
import { PopupPropType } from '../popup-manager';

export default function LeavePopup({
    isOpen,
    setIsOpen,
    closePopup,
    calendarID,
    calendarData,
    setCalendarData,
}: PopupPropType) {
    async function onClick() {
        let data = await CalendarAPI.leaveCalendar(calendarID);
        console.log(data);
        if (data.Status == 'ok') {
            setCalendarData(
                [...calendarData].filter(
                    (calendar) => calendar._id != calendarID
                )
            );
        }
        closePopup();
    }

    return (
        <HeadlessDialogue
            isOpen={isOpen == 'leave'}
            setIsOpen={() => {
                setIsOpen('leave');
            }}
            closePopup={closePopup}
            title="Leave Calendar"
        >
            <div className="w-full flex flex-col justify-center items-center">
                <p className="w-full text-center">Are you sure?</p>
                <div className="flex w-3/4 justify-evenly my-3">
                    <button
                        className="w-fit bg-red-400 text-white hover:bg-red-500 rounded transition-all duration-100 ease-linear p-2"
                        onClick={onClick}
                    >
                        Yes, leave
                    </button>
                    <button
                        className="w-fit bg-red-400 text-white hover:bg-red-500 rounded transition-all duration-100 ease-linear p-2"
                        onClick={closePopup}
                    >
                        No
                    </button>
                </div>
            </div>
        </HeadlessDialogue>
    );
}
