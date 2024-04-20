import dialogueStore from '../../../store/dialogueStore';
import { buttonMenuBridge } from './state';
import { useRef, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import RenameDialogue from './dialogues/RenameDialogue';
import DeleteDialogue from './dialogues/DeleteDialogue';

function dropDownMenu({calID, idx}) {
    const dialogueHook = dialogueStore((store) => store.setPanel)

    const setOpenMenuIdx = buttonMenuBridge((store) => store.setOpenMenuIdx)
    const openMenuIdx = buttonMenuBridge((store) => store.openMenuIdx)

    const menuRef = useRef(null)

    const handleClick = (event) => {
        if (menuRef.current === null || !menuRef.current.contains(event.target)) {
            setOpenMenuIdx(-1)
        }
    }

    return (
        <Menu as="div">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 invisible"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
            </svg>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                show={idx === openMenuIdx}
                beforeEnter={() => {
                    document.addEventListener("click", handleClick);
                }}
                beforeLeave={() => {
                    document.removeEventListener("click", handleClick);
                }}
            >
                <Menu.Items onKeyDown={(e) => { if (e.key === 'Escape') setOpenMenuIdx(-1) }} className="pointer-events-auto absolute w-20 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none -right-5">
                    <div className="px-1 py-1">
                        <div ref={(r) => { if (idx === openMenuIdx) menuRef.current = r }}>
                            <Menu.Item>
                                <button
                                    autoFocus
                                    className='ui-active:bg-red-400 ui-active:text-white ui-not-active:text-gray-900 
                                                    group flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none'
                                    onClick={() => {
                                        setOpenMenuIdx(-1)
                                        dialogueHook(<RenameDialogue calID={calID} />)
                                    }}
                                >
                                    Rename
                                </button>
                            </Menu.Item>
                            <Menu.Item>
                                <button
                                    className='ui-active:bg-red-400 ui-active:text-white ui-not-active:text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                    onClick={() => {
                                        setOpenMenuIdx(-1)
                                        dialogueHook(<DeleteDialogue calID={calID} />)
                                    }}
                                >
                                    Delete
                                </button>
                            </Menu.Item>
                        </div>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default dropDownMenu;