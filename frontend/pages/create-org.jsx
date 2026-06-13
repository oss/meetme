import React, { useEffect, useRef, useState } from "react";
import Tile from "../components/utils/tile";
import LargeButton from "../components/utils/large-button";
import { OrganizationAPI } from "../api/organization-api";
import userStore from '@store/userStore';
import { useNavigate } from "react-router-dom";

function CreateOrg() {
    let [organizationName, setOrganizationName] = useState(null);
    let [currentOrgNames, setCurrentOrgNames] = useState(null);
    const [displayAlertSuccess, setAlertSuccess] = useState(false);
    const [displayAlertFailureDuplicate, setAlertFailureDuplicate] =
        useState(false);
    let orgNameRef = useRef(null);

    const userHook = userStore((store) => store.getUserData);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrOrgNames();
    }, []);

    async function fetchCurrOrgNames() {
        let userData = await fetch(`${process.env.API_URL}/user/me`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json());
        let dataSet = await OrganizationAPI.getAllData(
            userData.data.organizations.map((org) => org._id)
        );
        setCurrentOrgNames(dataSet.map((data) => data.organization.name));
    }
    function orgAlertSuccess() {
        return (
            <div
                className="bg-green-100 rounded-lg py-5 px-6 mb-3 text-base text-green-700 inline-flex items-center w-full"
                role="alert"
            >
                <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="check-circle"
                    className="w-4 h-4 mr-2 fill-current"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                >
                    <path
                        fill="currentColor"
                        d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"
                    ></path>
                </svg>
                Success: Org Created!
                <button
                    type="button"
                    className="btn-close box-content w-4 h-4 p-1 ml-auto text-green-900 border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-yellow-900 hover:opacity-75 hover:no-underline"
                    onClick={() => {
                        {
                            setAlertSuccess(false);
                        }
                    }}
                    data-bs-dismiss="alert"
                >
                    X{" "}
                </button>
            </div>
        );
    }

    function orgAlertFailure() {
        return (
            <div
                className="bg-red-100 rounded-lg py-5 px-6 mb-3 text-base text-red-700 inline-flex items-center w-full"
                role="alert"
            >
                <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="times-circle"
                    className="w-4 h-4 mr-2 fill-current"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                >
                    <path
                        fill="currentColor"
                        d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                    ></path>
                </svg>
                This name is already used
                <button
                    type="button"
                    className="btn-close box-content w-4 h-4 p-1 ml-auto text-green-900 border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-yellow-900 hover:opacity-75 hover:no-underline"
                    onClick={() => {
                        {
                            setAlertFailureDuplicate(false);
                        }
                    }}
                    data-bs-dismiss="alert"
                >
                    X{" "}
                </button>
            </div>
        );
    }

    async function createNewOrganization() {
        if (!currentOrgNames.includes(organizationName)) {
            let data = await OrganizationAPI.createOrganization(
                organizationName
            );
            console.log(data);
            if (data.Status == "ok") {
                setOrganizationName("");
                setCurrentOrgNames([...currentOrgNames, organizationName]);
                setAlertSuccess(true);
                setAlertFailureDuplicate(false);
                userHook();
                navigate(`/org/${data.organization._id}`);
            } else {
                alert("Issue sending request");
            }
        } else {
            // duplicate
            setAlertFailureDuplicate(true);
            setAlertSuccess(false);
        }
        orgNameRef.current.value = "";
    }
    return (
        <div className="h-full bg-neutral-100 w-full">
            <p className="font-bold text-3xl text-center mb-6">
                Create a New Organization
            </p>
            <div className="flex">
                <div className="w-full md:w-3/4 lg:w-1/2 m-auto">
                    <Tile title={"Organization Name"}>
                        <input
                            ref={orgNameRef}
                            onChange={(e) => {
                                setOrganizationName(e.currentTarget.value);
                            }}
                            className="shadow appearance-none border rounded w-full h-9 py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="textfield"
                        />
                        <div className="w-1/3">
                            <LargeButton
                                click_passthrough={() => {
                                    if (organizationName !== "") {
                                        createNewOrganization();
                                    }
                                }}
                                text={"Create"}
                            ></LargeButton>
                        </div>
                        {displayAlertSuccess ? orgAlertSuccess() : <></>}
                        {displayAlertFailureDuplicate ? (
                            orgAlertFailure()
                        ) : (
                            <></>
                        )}
                    </Tile>
                </div>
            </div>
        </div>
    );
}

export default CreateOrg;
