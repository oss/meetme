import { useParams } from 'react-router-dom';

import calendarMaindataStore from '@store/calendarMaindata';
import calendarMetadataStore from '@store/calendarMetadata';
import googleStore from '@store/googleStore';
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
    const orgOwnerID = calendarMetadataStore((store) => store.calendarMetadata[id].data.owner._id);

    const setMemberSet = calendarPageStore((store) => store.setMemberSet)
    const allMembers = organizationMemberSetHook(orgOwnerID)
    useEffect(()=>{
        setMemberSet(allMembers)
    },[allMembers])

    const setMemberList = calendarPageStore((store) => store.setMemberList )
    const memberList = organizationMemberListHook(orgOwnerID)
    useEffect(()=>{
        setMemberList(memberList)
    },[memberList])


    const orgRole = orgData((store)=>{

        const organization = store.orgData[orgOwnerID].data;

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
    console.log('global loader')
    const { id } = useParams();
    const netID = authData((store) => store.userData.user.uid)

    const fetchCalendarMetadata = calendarMetadataStore((store) => store.fetchCalendarMetadata)
    const fetchCalendarMaindata = calendarMaindataStore((store) => store.fetchCalendarMaindata)
    const fetchGoogleEmail = googleStore((store) => store.fetchGoogleEmail);

    // disable all google stuff for now
    //const fetchGoogleValidate = googleStore((store) => store.fetchGoogleValidate);

    useEffect(() => {
        fetchCalendarMaindata(id);
        fetchCalendarMetadata(id);
    }, []);

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

    const orgIsLoaded = orgData((store)=>{
        if(!ownerType)
            return false
        if(!ownerID)
            return false;
        if(ownerType !== 'organization')
            return false;

        if (ownerID in store.orgData){
            return store.orgData[ownerID].isLoaded;
        };
        store.addOrg(ownerID);
        return false;
    });

    const readyToLoad = (() => {
        switch (ownerType) {
            case 'individual': {
                return calendarIsLoaded
            }

            case 'organization': {
                console.log('orgLoad status',orgIsLoaded);
                return orgIsLoaded && calendarIsLoaded;
            }
            default:{
                return new Error('this should not be hit...');
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
