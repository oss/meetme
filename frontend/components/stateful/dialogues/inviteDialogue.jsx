import { Dialog } from "@headlessui/react";
import { useRef, useState } from "react";
import RedButton from "../../utils/red-button";
import { create } from 'zustand';
import Tile from "../../lib/primitives/tile";
import { useEffect } from "react";
import dialogueStore from '../../../store/dialogueStore';
import BaseButton from "../../utils/base-button";
import TextBarWithEnter from '../../lib/primitives/textInputWithEnter'
import { Tab, TabGroup, TabList } from '@headlessui/react'
import calendarMetadata from '@store/calendarMetadata';

const inviteDialogueStore = create((set) => {
    const validateNetID = async (netid) => {
        const resp = await fetch(process.env.API_URL + '/user/' + netid, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const respJSON = await resp.json();
        if (respJSON.Status === 'ok') {
            set((previous_state) => {
                const newStatusMap = previous_state.pendingMemberStatus;
                newStatusMap[netid] = 'ok'
                return {
                    pendingMemberStatus: newStatusMap
                }
            })
        }
        else {
            set((previous_state) => {
                const newStatusMap = previous_state.pendingMemberStatus;
                newStatusMap[netid] = respJSON.error
                return {
                    pendingMemberStatus: newStatusMap
                }
            })
        }
    }

    const addNetID = (netid) => {

        set((previous_state) => {
            if (netid in previous_state.pendingMemberStatus) return previous_state;
            const clone = { ...previous_state };
            clone.pendingMemberStatus[netid] = 'pending'
            clone.pendingMemberOrder.push(netid)

            return clone;
        })
        validateNetID(netid)
    }

    const removeNetID = (netid) => {
        set((previous_state) => {
            const newPendingMemberOrder = [...(previous_state.pendingMemberOrder)]
            const netidIndex = newPendingMemberOrder.indexOf(netid)
            newPendingMemberOrder.splice(netidIndex, 1)

            return {
                pendingMemberOrder: newPendingMemberOrder
            }
        })


    }

    const clearStore = () => {
        set((previous_state) => ({
            pendingMemberOrder: [],
            pendingMemberStatus: {},
        }))
    }

    return {
        pendingMemberOrder: [],
        pendingMemberStatus: {},
        clearStore: clearStore,
        removeNetID: removeNetID,
        addNetID: addNetID
    }
})

function MemberSVGIcon({ netID }) {
    const pendingInviteStatus = inviteDialogueStore((store) => store.pendingMemberStatus[netID]);

    switch (pendingInviteStatus) {
        case 'pending': {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 animate-spin inline"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                </svg>
            )
        }
        case 'ok': {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="w-6 h-6 inline stroke-green-700"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            )
        }
        default: {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="w-6 h-6 inline stroke-rutgers_red hover:stroke-blue-700"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                </svg>
            )
        }
    }

}

function InviteDialogue({ calID }) {
    const textBarRef = useRef(null);
    const [textBarValue, setTextBarValue] = useState('')
    const [pendingInviteOrder, clearStore, addNetID, removeNetID, pendingMemberStatus] = inviteDialogueStore((store) => [store.pendingMemberOrder, store.clearStore, store.addNetID, store.removeNetID, store.pendingMemberStatus]);
    const inviteListOK = inviteDialogueStore((store) => {
        for (let i = 0; i < store.pendingMemberOrder.length; i++) {
            const netid = store.pendingMemberOrder[i]
            if (store.pendingMemberStatus[netid] !== 'ok') {
                return false
            }
        }
        return true
    });

    const closeDialogue = dialogueStore((store) => store.closePanel);

    const shareLinkState = calendarMetadata((store) => store.calendarMetadata[calID].data.shareLink)

    useEffect(() => {
        clearStore()

        return () => {
            clearStore()
        }
    }, [])

    const inviteUsers = async () => {
        await fetch(`${process.env.API_URL}/cal/${calID}/share`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                new_users: pendingInviteOrder,
            }),
        })
    }
    const setShareLinkStatus = async (status) => {
        await fetch(`${process.env.API_URL}/cal/${calID}/shareLink`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shareLink: status,
            }),
        })
    }

    useEffect(() => {
        if(textBarRef.current != null){
            setTextBarValue(textBarRef.current.value)
        }
      });


    return (
        <>
            <Dialog.Title>Invite Users By Netid</Dialog.Title>
            <ul>
                {pendingInviteOrder.map((pendingMember, idx) =>
                    <li key={idx} className='inline-flex align-middle'>
                        <Tile>
                            <div className='flex align-middle grow-0 bg-slate-400'>
                                <MemberSVGIcon netID={pendingMember} />
                                <p className="inline" >
                                    {pendingMember}
                                </p>
                                <div className="pr-2" />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    className="w-6 h-6 inline stroke-black hover:stroke-rutgers_red"
                                    onClick={() => { removeNetID(pendingMember) }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        </Tile>
                    </li>
                )}
            </ul>
            <div className="h-1" />
            <TextBarWithEnter type="text" ref={textBarRef} className="
                    w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:border-sky-500 focus:ring-1 focus:ring-sky-500" onEnter={() => {
                    if (textBarRef.current.value === '')
                        return
                    addNetID(textBarRef.current.value)
                    textBarRef.current.value = ''
                    setTextBarValue('')
                }} />
            <div className="h-1" />

            <div className='inline-flex w-full flex-row-reverse'>
                <RedButton disabled={!inviteListOK} onClick={() => {
                    if (textBarRef.current.value === '') {
                        const status = inviteUsers()
                        if (status)
                            closeDialogue()
                        return
                    }

                    addNetID(textBarRef.current.value)
                    textBarRef.current.value = ''
                    setTextBarValue('')
                }} >
                    <div className="grid grid-cols-1 grid-rows-1">
                        <p className={`${textBarValue.length === 0 || 'invisible'}`} style={{ gridColumn: 1, gridRow: 1 }}>Invite</p>
                        <p className={`${textBarValue.length === 0 && 'invisible'}`} style={{ gridColumn: 1, gridRow: 1 }}>Add</p>
                    </div>
                </RedButton>
                <BaseButton className='border-1 border-solid bg-slate-400 p-1' onClick={() => { closeDialogue() }}>
                    <p>Close</p>
                </BaseButton>
                <p className = {`mr-2 ${inviteListOK ? 'hidden': ""}`}>Remove all invalid or inactive netids</p>
            </div>
            <TabGroup defaultIndex={shareLinkState ? 0 : 1} onChange={(index) => {
            setShareLinkStatus(index === 0);
            }}>
            <p>Link Sharing</p>
            <TabList className="my-2 w-fit flex gap-x-3 rounded-xl bg-white p-2">
            {['Enabled', 'Disabled'].map((category) =>
                <Tab
                    key={category}
                    className={({ selected }) =>
                        `transition-all ease-linear duration-75 w-full rounded-lg p-2.5 text-base font-medium leading-5 text-red-700 outline-none 
                        ${selected ? "bg-rutgers_red shadow text-white" : "bg-slate-50 text-rutgers_red hover:shadow-md"}`
                    }
                >
                    {category}
                </Tab>
            )}
            </TabList>
            <BaseButton className='inline border-1 border-solid bg-slate-50 p-1 hover:bg-slate-100 hover:shadow-md"' onClick={() =>  navigator.clipboard.writeText(window.location.href)}>
                    <p>Copy Link</p>
            </BaseButton>
            </TabGroup>

        </>
    )
}

export default InviteDialogue;