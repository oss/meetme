import { create } from 'zustand';
import userData from './userStore';

const useStore = create(set => {
    const unsub1 = userData.subscribe((state) => state.organizations, (arr) => {
        updateOrgJSON()
    })

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
                    orgJSON: orgJSON
                }
            })
        }
    }

    const updateOrgJSON = async () => {
        set((previous_state) => {
            const currentOrganizations = userData.getState().organizations;
            const orgJSON = { ...previous_state.OrgData };

            for (let i = 0; i < currentOrganizations.length; i++) {
                const orgID = currentOrganizations[i]._id

                let downloadOrgData = false;
                if (orgID in orgJSON === false)
                    orgJSON[orgID] = { isLoaded: false }

                if(orgJSON[orgID].isLoaded === false)
                downloadOrgData = true

                if(downloadOrgData)
                    fetchOrgData(orgID)
            }

            return {
                orgData: orgJSON
            }
        });
    }

    const initOrgData = () => {
        const currentOrganizations = userData.getState().organizations;
        const orgJSON = {}

        for (let i = 0; i < currentOrganizations.length; i++) {
            orgJSON[currentOrganizations[i]._id] = { isLoaded: false }
        }
        return orgJSON
    }

    return {
        fetchOrgData: fetchOrgData,
        updateOrgJSON: updateOrgJSON,
        orgData: initOrgData()
    }
})

export default useStore;