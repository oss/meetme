import { Tab } from '@headlessui/react';

function CustomTab({ children, isBlue = false }) {
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ');
    }
    return (
        <Tab
            key={children}
            className={({ selected }) =>
                classNames(
                    `transition-all outline-none duration-50 ease-linear w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-${
                        isBlue ? 'blue' : 'red'
                    }-700`,
                    selected ? 'bg-white shadow' : `hover:bg-white shadow `
                )
            }
        >
            {children}
        </Tab>
    );
}

function CalendarTabs({ GlobalCalendar, UserCalendar }) {
    return (
        <Tab.Group>
            <div className="w-full max-w-md p-2 sm:px-0">
                <Tab.List className="flex space-x-1 rounded-xl">
                    <CustomTab>Shared Calendar</CustomTab>
                    <CustomTab isBlue={true}>Your Calendar</CustomTab>
                </Tab.List>
            </div>
            <Tab.Panels>
                <Tab.Panel>{GlobalCalendar}</Tab.Panel>
                <Tab.Panel>{UserCalendar}</Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    );
}

export default CalendarTabs;
