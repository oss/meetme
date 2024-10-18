import calendarMaindata from '@store/calendarMaindata';
import orgData from '@store/orgData';

const individualMemberListHook = (calID) => {
    const owner = calendarMaindata((store)=> store.calendarData[calID].data.owner._id)
    const users = calendarMaindata((store)=> store.calendarData[calID].data.users)

    const arr = []

    arr.push({ role: 'owner', IDs: [owner] })

    arr.push({ role: 'users', IDs: [] })
    users.forEach((member, index) => {
        if (owner !== member._id)
            arr[1]['IDs'].push(member._id)
    });

    return arr

}

const individualMemberSetHook = (calID) => {
    const owner = calendarMaindata((store)=> store.calendarData[calID].data.owner._id)
    const users = calendarMaindata((store)=> store.calendarData[calID].data.users)

    const set = new Set();

    set.add(owner)
    users.forEach((member, index) => {
        set.add(member._id)
    })
    return set

}

const organizationMemberListHook = (orgID) => {

    const [owner, admins, editors, members, viewers] = orgData((store) => [
        store.orgData[orgID].data.owner,
        store.orgData[orgID].data.admins,
        store.orgData[orgID].data.editors,
        store.orgData[orgID].data.members,
        store.orgData[orgID].data.viewers,
    ]);

    const arr = []

    arr.push({ role: 'owner', IDs: [owner] })

    arr.push({ role: 'admins', IDs: [] })
    admins.forEach((member, index) => {
        arr[1]['IDs'].push(member._id)
    });

    arr.push({ role: 'editors', IDs: [] })
    editors.forEach((member, index) => {
        arr[2]['IDs'].push(member._id)
    });

    arr.push({ role: 'members', IDs: [] })
    members.forEach((member, index) => {
        arr[3]['IDs'].push(member._id)
    });

    arr.push({ role: 'viewers', IDs: [] })
    viewers.forEach((member, index) => {
        arr[4]['IDs'].push(member._id)
    });

    return arr
}

const organizationMemberSetHook = (orgID) => {
    const [owner, admins, editors, members, viewers] = orgData((store) => [
        store.orgData[orgID].data.owner,
        store.orgData[orgID].data.admins,
        store.orgData[orgID].data.editors,
        store.orgData[orgID].data.members,
        store.orgData[orgID].data.viewers,
    ]);

    const set = new Set()

    set.add(owner)

    admins.forEach((member, index) => {
        set.add(member._id)
    });

    editors.forEach((member, index) => {
        set.add(member._id)
    });

    members.forEach((member, index) => {
        set.add(member._id)
    });

    viewers.forEach((member, index) => {
        set.add(member._id)
    });

    return set


}

export { individualMemberListHook, individualMemberSetHook, organizationMemberListHook, organizationMemberSetHook }
