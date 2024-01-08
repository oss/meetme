import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function CollaboratorsContainer({ collaborators }) {
    const [collaborators_, set_collaborators] = useState([]);
    useEffect(() => {
        set_collaborators([...collaborators]);
    }, [collaborators]);
    return (
        <div className="w-full h-72 rounded-lg grid grid-cols-2 auto-rows-min mt-2">
            {collaborators_.map((collaborator) => (
                <div
                    className="w-full text-gray-600 max-h-fit
                flex flex-row col-span-1 row-span-1 items-center"
                    key={collaborator.netID}
                >
                    <div
                        className="rounded-full w-8 h-8 bg-red-500 m-2"
                        style={{
                            backgroundColor: collaborator.profileColor,
                        }}
                    />
                    <div className="flex flex-col w-fit mt-2">
                        <div>{collaborator.name}</div>
                        <div className="text-gray-500 text-xs ml-0.5">
                            {collaborator.netID}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CollaboratorsContainer;
