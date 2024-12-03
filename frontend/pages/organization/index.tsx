import { useState, useEffect } from 'react';
import orgStore from '@store/orgData';
import authStore from '@store/authStore';
import { useParams } from 'react-router-dom';
import OrgOwner from './org-owner';
import OrgUser from './org-user';
import Cookies from 'js-cookie';

enum ORG_ROLES {
  OWNER,
  ADMIN,
  EDITOR,
  MEMBER,
  VIEWER
}

function LoadingPage() {
    return(
        <div>
            <p>Loading</p>
        </div>
    )
}

function OrgLoader() {
    const { orgID } = useParams();
    const netID = authStore((store)=>store.userData.user.uid);

    const orgData = orgStore((store)=>store.orgData[orgID]) //optimize this state
    const addOrg = orgStore((store)=>store.addOrg)
    const fetchOrg = orgStore((store)=>store.fetchOrgData)
    const isLoaded = (() => {
        if (orgData === undefined)
            return false;
        return orgData.isLoaded
    })()

    const orgRole = (() => {
        if (!isLoaded) return null;

        const organization = orgData.data;

        const isOwner = (organization.owner === netID);
        if (isOwner) return ORG_ROLES.OWNER

        const isAdmin = organization.admins.some((uname) => uname._id === netID)
        if (isAdmin) return ORG_ROLES.ADMIN

        const isEditor = organization.editors.some((uname) => uname._id === netID)
        if (isEditor) return ORG_ROLES.EDITOR

        const isMember = organization.members.some((uname) => uname._id === netID)
        if (isMember) return ORG_ROLES.MEMBER

        const isViewer = organization.viewers.some((uname) => uname._id === netID)
        if (isViewer) return ORG_ROLES.VIEWER
    })()

    useEffect(() => {
        if(orgData === undefined)
            addOrg(orgID)
        else
            fetchOrg(orgID)
    },[])


    if (!isLoaded) {
        return <div>Loading</div>;
    }

    switch (orgRole) {
        case ORG_ROLES.OWNER: return <OrgOwner />
        case ORG_ROLES.MEMBER: return <OrgUser />
        default: return <div>not implmeneted yet</div>
    }
}

export default OrgLoader;
