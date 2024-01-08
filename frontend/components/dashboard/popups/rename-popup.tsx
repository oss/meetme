import { useState } from 'react';
import { CalendarAPI } from '../../../api/calendar-api';
import HeadlessDialogue from '../../utils/headless-dialogue';

import { PopupPropType, popupOptions } from '../popup-manager';

export default function RenamePopup({
    isOpen,
    setIsOpen,
    closePopup,
    calendarID,
    calendarData,
    setCalendarData,
}: PopupPropType) {
    const [newName, setNewName] = useState<string>('');

    async function onClick() {
        let data = await CalendarAPI.renameCalendar(calendarID, newName);
        if (data.Status == 'ok') {
            setCalendarData(
                [...calendarData].map((calendar) => {
                    if (calendar._id == calendarID) {
                        calendar.name = newName;
                    }
                    return calendar;
                })
            );
        }
        closePopup();
    }

    return (
        <HeadlessDialogue
            isOpen={isOpen == 'rename'}
            setIsOpen={() => {
                setIsOpen('rename');
            }}
            closePopup={closePopup}
            title={'Rename calendar'}
        >
            <div className="flex flex-col">
                <input
                    type="text"
                    className="my-2 w-full outline-none border border-gray-500/50 rounded p-1"
                    onChange={(e) => {
                        setNewName(e.currentTarget.value);
                    }}
                />
                <button
                    className="bg-red-400 text-white rounded p-2 w-fit hover:bg-red-500 transition-all duration-100 ease-linear"
                    onClick={onClick}
                >
                    Rename
                </button>
            </div>
        </HeadlessDialogue>
    );
}
