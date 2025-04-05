import { Tab } from "@headlessui/react";

function Tabs({
    categories,
    panels,
}: {
    categories: string[];
    panels: React.ReactNode[];
}) {
    return (
        <Tab.Group>
            <Tab.List className="my-2 w-fit flex gap-x-3 rounded-xl bg-white p-2">
                {categories.map((category) => {
                    return (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                `transition-all ease-linear duration-75 w-full rounded-lg p-2.5 text-base font-medium leading-5 text-red-700 outline-none
                                ${selected ? "bg-rutgers_red shadow text-white" : "text-rutgers_red hover:shadow-md"}`
                            }
                        >
                            {category}
                        </Tab>
                    );
                })}
            </Tab.List>
            <Tab.Panels>
                {panels.map((panel, i) => {
                    return <Tab.Panel key={i}>{panel}</Tab.Panel>;
                })}
            </Tab.Panels>
        </Tab.Group>
    );
}

export default Tabs;