import { create } from 'zustand';
import { produce } from 'immer';

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
            set(
                produce((prevState) => {
                    prevState.orgData[orgID] = {
                        isLoaded: true,
                        error: false,
                        data: resp_json.organization,
                    };
                }),
            )
        }
    }


    const addOrg = (orgID) => {
        let shouldFetch = true;

        set(produce((prevState) => {

            if (orgID in prevState.orgData) {
                shouldFetch = false
                return;
            }

            prevState.orgData[orgID] = {
                isLoaded: false,
                error: false,
                data: {},
            };
        }));

        if (!shouldFetch) return;

        console.log('fetching',orgID)
        fetchOrgData(orgID)
    }

    return {
        fetchOrgData: fetchOrgData,
        addOrg: addOrg,
        orgData: {}
    }
})

export default useStore;
