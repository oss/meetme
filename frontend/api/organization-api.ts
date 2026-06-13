export const OrganizationAPI = {
    getData: async (organizationID: string) => {
        let data = await fetch(`${process.env.API_URL}/org/${organizationID}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json());
        return data;
    },

    getAllData: async (organizationIDs: [string]) => {
        let responses = await Promise.all(
            organizationIDs.map((organizationID: string) => {
                return fetch(`${process.env.API_URL}/org/${organizationID}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            })
        );
        let data = await Promise.all(responses.map((res) => res.json()));
        return data;
    },
    createOrganization: async (organizationName: string) => {
        let data = await fetch(`${process.env.API_URL}/org`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: organizationName,
            }),
        }).then((res) => res.json());
        return data;
    },
    acceptOrgInvite: async (organizationID: string) => {
        let data = await fetch(
            `${process.env.API_URL}/org/${organizationID}/accept`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        ).then((res) => res.json());

        return data;
    },
    declineOrgInvite: async (organizationID: string) => {
        let data = await fetch(
            `${process.env.API_URL}/org/${organizationID}/decline`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        ).then((res) => res.json());
        return data;
    },
};
