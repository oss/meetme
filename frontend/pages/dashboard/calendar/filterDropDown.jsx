import filterStore from '@store/filterStore';

import { Menu, Transition, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { Field, Label, Radio, RadioGroup } from '@headlessui/react'

function filterDropDown() {
    const filterHook = filterStore((store) => store.setFilter);
    const ascendingHook = filterStore((store) => store.setAscending);

    return (
        <Menu >
            <MenuButton className='data-[active]:bg-gray-200 my-2 w-fit gap-x-3 rounded-xl bg-white p-2'>
                Filter
            </MenuButton>
            <Transition
                enter="transition ease-out duration-75"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <MenuItems
                    anchor="bottom end"
                    className="w-52 origin-top-right rounded-xl border bg-white"
                >
                    <MenuItem>
                        <button
                            className='
                                data-[active]:bg-red-400 data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none
                            '
                            onClick={() => {
                                filterHook("Name")
                            }}
                        >
                            Name
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            className='
                                data-[active]:bg-red-400 data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none
                            '
                            onClick={()=>{
                                filterHook("TimeCreated")
                            }}
                        >
                            Time created
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            className='
                                data-[active]:bg-red-400 data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none
                            '
                            onClick={()=>{
                                ascendingHook(true)
                            }}
                        >
                            Ascending
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            className='
                                data-[active]:bg-red-400 data-[active]:text-white 
                                 text-gray-900 
                                flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none
                            '
                            onClick={()=>{
                                ascendingHook(false)
                            }}
                        >
                            Descending
                        </button>
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    )
}

export default filterDropDown;