import filterStore from '@store/filterStore';
import userStore from '@store/userStore';


import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import { Field, Transition, Fieldset, Label, Select } from '@headlessui/react'

function filterDropDown() {
    const filterHook = filterStore((store) => store.setCalFilter);
    const ascendingHook = filterStore((store) => store.setCalAscending);

    const orgFilterHook = filterStore((store) => store.setOrgFilter);
    const orgAscendingHook = filterStore((store) => store.setOrgAscending);

    const [calFilter, calAscending, orgFilter, orgAscending, selectedIndex] = filterStore((store) => [store.calFilter, store.calAscending, store.orgFilter, store.orgAscending, store.selectedIndex]);


    return (
        <Popover className="group content-center mx-5">
            <PopoverButton className={`outline-none my-2 w-fit flex rounded-xl bg-white p-2 text-red-700 hover:shadow-md 
            group-data-[open]:bg-rutgers_red group-data-[open]:shadow group-data-[open]:text-white`}>
                Filter</PopoverButton>
            <Transition
                enter="transition ease-out duration-75"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                {
                selectedIndex === 0
                ?
                <PopoverPanel anchor="bottom start" className="origin-top-right rounded-xl border bg-white p-4">
                    <Fieldset className="space-y-8">
                        <Field>
                            <Label className="block">Sort By</Label>
                            <Select className="mt-1 block" name="Sort By" value = {calFilter} onChange={(e) => {filterHook(e.target.value)}}>
                            <option>Name</option>
                            <option>Time Created</option>
                            <option>Time Modified</option>
                            </Select>
                        </Field>
                        <Field>
                            <Label className="block">Sort Order</Label>
                            <Select className="mt-1 block" name="Sort Order" value = {calAscending ? "Ascending" : "Descending"}  onChange={(e) => {ascendingHook(e.target.value === "Ascending")}}>
                            <option>Ascending</option>
                            <option>Descending</option>
                            </Select>
                        </Field>
                    </Fieldset>
                </PopoverPanel>
                :                
                <PopoverPanel anchor="bottom start" className="origin-top-right rounded-xl border bg-white p-4">
                <Fieldset className="space-y-8">
                    <Field>
                        <Label className="block">Sort By</Label>
                        <Select className="mt-1 block" name="Sort By" value = {orgFilter} onChange={(e) => {orgFilterHook(e.target.value)}}>
                        <option>Name</option>
                        <option>Time Created</option>
                        </Select>
                    </Field>
                    <Field>
                        <Label className="block">Sort Order</Label>
                        <Select className="mt-1 block" name="Sort Order" value = {orgAscending ? "Ascending" : "Descending"}  onChange={(e) => {orgAscendingHook(e.target.value === "Ascending")}}>
                        <option>Ascending</option>
                        <option>Descending</option>
                        </Select>
                    </Field>
                </Fieldset>
            </PopoverPanel>
                }
            </Transition>
        </Popover>
    )
}

export default filterDropDown;