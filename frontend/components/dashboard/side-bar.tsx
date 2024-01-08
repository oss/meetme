import { useEffect, useState } from 'react';
import { OrganizationAPI } from '../../api/organization-api';
import { Link } from 'react-router-dom';
import uniqid from 'uniqid';
export default function SideBar({ allOrgData }: { allOrgData: any[] }) {
    return (
        <div className="invisible w-0 lg:w-1/4 lg:visible lg:p-2 h-full max-h-[80vh] bg-white shadow-sm overflow-y-auto  flex flex-col items-center">
            <div className="w-4/5 flex flex-col">
                <p className="text-lg ">Organizations</p>
                {allOrgData.map((org: any, i: number) => {
                    return (
                        <Link
                            key={i}
                            to={`/org/${org._id}`}
                            className="w-full transition-all ease-linear duration-100 border-l-4 hover:border-l-8 shadow-md rounded my-2 p-2 overflow-hidden"
                        >
                            {org.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
