import { Tab } from "@headlessui/react";

function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
}

export default function Tabs({
    categories,
    panels,
}: {
    categories: string[];
    panels: React.ReactNode[];
}) {
    return (
        <Tab.Group>
            <Tab.List className="my-2 w-fit flex space-x-12 rounded-xl bg-white p-2">
                {categories.map((category) => {
                    return (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                classNames(
                                    "transition-all ease-linear duration-75 w-full rounded-lg p-2.5 text-base font-medium leading-5 text-red-700 outline-none",
                                    selected
                                        ? "bg-red-400 shadow text-white"
                                        : "text-red-300 hover:shadow-md"
                                )
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
