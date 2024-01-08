import React from 'react';
import RenamePopup from './popups/rename-popup';
import DeletePopup from './popups/delete-popup';
import LeavePopup from './popups/leave-popup';
import { useCalendarDataContext } from '../../pages/dashboard2';

export type popupOptions = 'rename' | 'delete' | 'leave' | 'none';

export interface PopupPropType {
    isOpen: popupOptions;
    setIsOpen: (open: popupOptions) => void;
    closePopup: () => void;
    calendarID: string;
    calendarData: any[];
    setCalendarData: (data: any) => void;
}

export default function PopupManager({
    popupSelection,
    setPopupSelection,
    calendarID,
}: {
    popupSelection: popupOptions;
    setPopupSelection: (arg: popupOptions) => void;
    calendarID: string;
}) {
    const { calendarData, setCalendarData } = useCalendarDataContext();

    function sendProps(
        OrginalComponent: React.ElementType<PopupPropType>,
        option: popupOptions
    ) {
        return (
            <OrginalComponent
                isOpen={popupSelection}
                setIsOpen={() => {
                    setPopupSelection(option);
                }}
                closePopup={() => {
                    setPopupSelection('none');
                }}
                calendarData={calendarData}
                setCalendarData={setCalendarData}
                calendarID={calendarID}
            />
        );
    }

    switch (popupSelection) {
        case 'rename':
            return sendProps(RenamePopup, 'rename');
        case 'delete':
            return sendProps(DeletePopup, 'delete');
        case 'leave':
            return sendProps(LeavePopup, 'leave');
        case 'none':
            return <></>;
        default:
            return <></>;
    }
}
