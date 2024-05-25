import { create } from 'zustand';
import userData from './userStore';

const useStore = create(set => {

    const fetchOrgData = async (orgID) => {
        const resp = await fetch(process.env.API_URL + `/org/${orgID}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const resp_json = await resp.json();
        console.log(resp_json)

        if (resp_json.Status === 'ok') {
            set((previous_state) => {
                const orgJSON = { ...previous_state.orgData };

                orgJSON[orgID].isLoaded = true
                orgJSON[orgID].data = resp_json.organization
                return {
                    orgData: orgJSON
                }
            })
        }
    }


    const addOrg = (orgID) => {
        set((previous_state) => {
            const orgJSON = { ...previous_state.orgData };
            if(orgID in orgJSON)
                return previous_state

            orgJSON[orgID] = {}
            orgJSON[orgID].isLoaded = false
            return {
                orgData: orgJSON
            }
        })

        fetchOrgData(orgID)
    }


    return {
        fetchOrgData: fetchOrgData,
        addOrg: addOrg,
        orgData: {}
    }
})

export default useStore;