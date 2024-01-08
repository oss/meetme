import React, { useState } from 'react';

function renderCollabatorListElement(data) {
    const [nameState, setNameState] = useState('loading name...');
    fetch(process.env.API_URL + '/user/' + data._id, {
        method: 'GET',
        credentials: 'include',
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.Status == 'ok') {
                const user_info = data.data;
                setNameState(user_info.name.first + ' ' + user_info.name.last);
            }
        });
    return (
        <li className="flex items-center">
            <div className="rounded-full w-8 h-8 inline-flex bg-red-400 mr-2 text-gray-600 items-center justify-center">
                {data._id.charAt(0)}
            </div>
            <div className="inline-block">
                <div>{nameState}</div>
                <div
                    className="text-gray-500 text-xs"
                    style={{ position: 'relative', top: '-5px' }}
                >
                    {data._id}
                </div>
            </div>
        </li>
    );
}

function renderCollabatorsList(netIdTypes, members) {
    return (
        <ul>
            {members.map((data) => {
                if (netIdTypes.includes(data.type))
                    return renderCollabatorListElement(data);
                return <></>;
            })}
        </ul>
    );
}

export default renderCollabatorsList;
