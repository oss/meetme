import { useParams } from 'react-router-dom';

import calendarMaindataStore from '@store/calendarMaindata';
import calendarMetadataStore from '@store/calendarMetadata';
import authData from '@store/authStore';
import orgData from '@store/orgData';

import CalendarOwnerPage from './calendar-owner';
import CalendarUserPage from './calendar-user';

import { individualMemberListHook, individualMemberSetHook, organizationMemberListHook, organizationMemberSetHook } from './hooks';
import calendarPageStore from './store';
import { useState, useEffect } from 'react';

function LoadingPage() {
    return (<div>Loading...</div>)
}

function IndividualCalendarLoader() {
    const netID = authData((store) => store.userData.user.uid)
    const { id } = useParams();

    const setMemberSet = calendarPageStore((store) => store.setMemberSet)
    const allMembers = individualMemberSetHook(id)
    useEffect(()=>{
        setMemberSet(allMembers)
    },[allMembers])

    const setMemberList = calendarPageStore((store) => store.setMemberList )
    const memberList = individualMemberListHook(id)
    useEffect(()=>{
        setMemberList(memberList)
    },[memberList])

    const individualRole = calendarMaindataStore((store) => {
        const calendar = store.calendarData[id].data;

        const isOwner = (calendar.owner._id === netID);
        if (isOwner) return 'owner'

        const isUser = calendar.users.some((uname) => uname._id === netID)
        if (isUser) return 'user'

        const isViewer = calendar.viewers.some((uname) => uname._id === netID)
        if (isViewer) return 'viewer'
    })

    switch (individualRole) {
        case 'owner':
            return <CalendarOwnerPage calID={id} />
        case 'user':
            return <CalendarUserPage calID={id} />

    }
}

function OrganizationCalendarLoader(){
    const netID = authData((store) => store.userData.user.uid)
    const { id } = useParams();
    const ownerID = calendarMaindataStore((store) => store.calendarData[id].data.owner._id)

    const setMemberSet = calendarPageStore((store) => store.setMemberSet)
    const allMembers = organizationMemberSetHook(ownerID)
    useEffect(()=>{
        setMemberSet(allMembers)
    },[allMembers])

    const setMemberList = calendarPageStore((store) => store.setMemberList )
    const memberList = organizationMemberListHook(ownerID)
    useEffect(()=>{
        setMemberList(memberList)
    },[memberList])

    const orgRole = orgData((store)=>{

        const organization = store.orgData[ownerID].data;

        const isOwner = (organization.owner === netID);
        if (isOwner) return 'owner'

        const isAdmin = organization.admins.some((uname) => uname._id === netID)
        if (isAdmin) return 'admin'

        const isEditor = organization.editors.some((uname) => uname._id === netID)
        if (isEditor) return 'editor'

        const isMember = organization.members.some((uname) => uname._id === netID)
        if (isMember) return 'member'

        const isViewer = organization.viewers.some((uname) => uname._id === netID)
        if (isViewer) return 'viewer'

    })

    switch (orgRole) {
        case 'owner':
            return <CalendarOwnerPage calID={id} />
        case 'admin':
            return <CalendarOwnerPage calID={id} />
        case 'editor':
            return <CalendarOwnerPage calID={id} />
        case 'member':
            return <CalendarUserPage calID={id} />
    }
}


function CalendarLoader() {
    const { id } = useParams();
    const netID = authData((store) => store.userData.user.uid)

    const fetchCalendarMetadata = calendarMetadataStore((store) => store.fetchCalendarMetadata)
    const fetchCalendarMaindata = calendarMaindataStore((store) => store.fetchCalendarMaindata)

    useEffect(() => {
        async function sharelink(calendarID){
            const data = await fetch(
                `${process.env.API_URL}/cal/${calendarID}/share_with_link`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            ).then((res) => res.json());
            fetchCalendarMaindata(id);
            fetchCalendarMetadata(id);
            return data.Status
        }
        sharelink(id);

    }, [])

    const loadedMaindata = calendarMaindataStore((store) => {
        if (id in store.calendarData) return store.calendarData[id].isLoaded

        store.addCalendar(id)
        return false;
    })
    const loadedMetadata = calendarMetadataStore((store) => {
        if (id in store.calendarMetadata) return store.calendarMetadata[id].isLoaded

        store.addCalendar(id)
        return false;
    })

    const calendarIsLoaded = loadedMaindata && loadedMetadata;

    const ownerType = calendarMaindataStore((store) => calendarIsLoaded && store.calendarData[id].data.owner.owner_type)
    const ownerID = calendarMaindataStore((store) => calendarIsLoaded && store.calendarData[id].data.owner._id)

    const error = calendarMetadataStore((store) =>  store.calendarMetadata[id].error)

    /*
    const [orgInit ,orgLoaded, addOrg] = orgData((store)=>{
        if(ownerType !== 'organization')
            return Array(3).fill(null)

        const orgInitialized = ownerID in store.orgData
        const orgLoaded = orgInitialized && store.orgData[ownerID].isLoaded

        return [orgInitialized, orgLoaded, store.addOrg];
    })
    */

    const readyToLoad = (() => {
        switch (ownerType) {
            case 'individual': {
                return calendarIsLoaded
            }

            case 'organization': {
                if(orgInit === false){
                    addOrg(ownerID)
                }
                return orgLoaded;
            }
            default:{
                return error;
            }
        }
    })()

    if (readyToLoad === false) return <LoadingPage />

    switch (ownerType) {
        case 'individual': {
            return <IndividualCalendarLoader />
        }
        case 'organization': {
            return <OrganizationCalendarLoader />
        }
    }



    return <p className={`text-center m-4 text-rutgers_red `}>The calendar does not exist or you do not have access to this calendar</p>
}

export default CalendarLoader;
