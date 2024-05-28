import filterStore from '@store/filterStore';


import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import { Field, Transition, Fieldset, Label, Select } from '@headlessui/react'

function filterDropDown() {
    const filterHook = filterStore((store) => store.setFilter);
    const ascendingHook = filterStore((store) => store.setAscending);

    const [filter, ascending] = filterStore((store) => [store.filter, store.ascending])

    return (
        <Popover className="relative group ">
            <PopoverButton className="my-2 w-fit flex rounded-xl bg-white p-2 group-data-[open]:bg-gray-200">Filter</PopoverButton>
            <Transition
                enter="transition ease-out duration-75"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <PopoverPanel anchor="bottom end" className="origin-top-right rounded-xl border bg-white p-4">
                    <Fieldset className="space-y-8">
                        <Field>
                            <Label className="block">Sort By</Label>
                            <Select className="mt-1 block" name="Sort By" value = {filter} onChange={(e) => {filterHook(e.target.value)}}>
                            <option>Name</option>
                            <option>Time Created</option>
                            <option>Time Modified</option>
                            </Select>
                        </Field>
                        <Field>
                            <Label className="block">Sort Order</Label>
                            <Select className="mt-1 block" name="Sort Order" value = {ascending ? "Ascending" : "Descending"}  onChange={(e) => {ascendingHook(e.target.value === "Ascending")}}>
                            <option>Ascending</option>
                            <option>Descending</option>
                            </Select>
                        </Field>
                    </Fieldset>
                </PopoverPanel>
            </Transition>
        </Popover>
    )
}

export default filterDropDown;