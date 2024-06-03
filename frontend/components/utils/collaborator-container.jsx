import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

function CollaboratorsContainer({ collaborators }) {
    return (
        <div className="w-full h-72 rounded-lg grid grid-cols-2 auto-rows-min">
            {collaborators.map((collaborator) => (
                <div
                    className="w-full text-gray-600 max-h-fit flex flex-row col-span-1 row-span-1 items-center"
                    key={collaborator.netID}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 m-2 border rounded-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <div className="flex flex-col w-fit">
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
