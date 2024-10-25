import dialogueStore from '@store/dialogueStore';
import { buttonMenuBridge } from './state';
import { useRef, Fragment } from 'react';
import { Menu, Transition, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import RenameDialogue from '@components/stateful/dialogues/renameDialogue';
import DeleteDialogue from '@components/stateful/dialogues/deleteDialogue';
import { hoveredTileStore } from '../store'

function dropDownMenu({ calID, idx }) {
    const dialogueHook = dialogueStore((store) => store.setPanel)
    const tileListRef = hoveredTileStore((store)=> store.hoveredTileListRef)

    const makeTileActive = () => {
        tileListRef.current.childNodes.item(idx).setAttribute('data-hover',true)
    }
    const makeTileInactive = () => {
        tileListRef.current.childNodes.item(idx).setAttribute('data-hover',false)
    }

    return (
        <Menu>
            <MenuButton className='pointer-events-auto data-[active]:bg-gray-200' onMouseEnter={makeTileActive} onMouseLeave={makeTileInactive}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className='w-4 h-4 stroke-black hover:stroke-red-400 '
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                </svg>
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
                            className='data-[active]:bg-rutgers_red data-[active]:text-white text-gray-900 flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none'
                            onClick={() => {
                                dialogueHook(<RenameDialogue calID={calID} />)
                            }}
                        >
                            Rename
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            className='
                                data-[active]:bg-rutgers_red data-[active]:text-white text-gray-900
                        flex w-full items-center rounded-md px-2 py-2 text-sm focus:border-0 focus:outline-none
                            '
                            onClick={()=>{
                                dialogueHook(<DeleteDialogue calID={calID} />)
                            }}
                        >
                            Delete
                        </button>
                    </MenuItem>
                </MenuItems>
            </Transition>
        </Menu>
    )
}

export default dropDownMenu;
