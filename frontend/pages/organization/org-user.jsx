import { useState, useRef } from "react";
import Tile from "../../components/utils/tile";
import { Link } from "react-router-dom";
import Dialogue from "../../components/utils/popup-dialogue";

function OrgUser({ calendars, members, pendingMembers, orgData }) {
    return (
        <div className="h-full bg-neutral-100 flex justify-center">
            <div className="w-10/12">
                <div className="w-full md:grid md:grid-cols-2 md:gap-5">
                    <div className="w-full h-full">
                        <Tile title="Members" fullHeight={true}>
                            <div className="py-2 flex flex-wrap">
                                {members.map((member) => {
                                    return (
                                        <p
                                            key={member._id}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                        >
                                            {member._id}
                                        </p>
                                    );
                                })}
                                {members.length == 0
                                    ? "No members added yet"
                                    : ""}
                            </div>
                        </Tile>
                    </div>
                    <div className="w-full h-full">
                        <Tile title="Calendars" fullHeight={true}>
                            <div className="py-2 flex flex-wrap">
                                {calendars.map((calendar) => {
                                    return (
                                        <Link
                                            key={calendar._id + "1"}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                            to={"/cal/" + calendar._id}
                                        >
                                            {calendar.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </Tile>
                    </div>
                    <div className="w-full h-fit">
                        <Tile title="Pending Members">
                            <div className="py-2 flex flex-wrap">
                                {pendingMembers.map((pendingMember) => {
                                    return (
                                        <p
                                            key={pendingMember._id}
                                            className="my-1 mr-8 p-3 shadow rounded"
                                        >
                                            {pendingMember._id}
                                        </p>
                                    );
                                })}
                            </div>
                        </Tile>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeletePopup({ onClickNo, visible, onClickYes }) {
    let [showConfirm, setShowConfirm] = useState(false);

    let [randomString, setRandomString] = useState("");

    let inputConfirm = useRef(null);

    function confirmDelete() {
        if (inputConfirm.current.value === randomString) {
            onClickYes();
        } else {
            setShowConfirm(false);
            onClickNo();
            alert("text did not match");
        }
    }

    return (
        <div
            className={
                "flex flex-col items-center justify-center " +
                (visible ? "" : `hidden `)
            }
        >
            <Dialogue>
                <div className="flex flex-col items-center justify-center w-1/5 min-w-fit bg-white rounded m-1 p-5">
                    <div className={showConfirm ? " hidden" : ""}>
                        <p className="text-xl mb-2">Are you sure?</p>
                        <div className={"flex "}>
                            <button
                                className="px-4 mr-7 text-white  rounded bg-rose-600 
							transition-all duration-100 ease-linear hover:scale-95"
                                onClick={() => {
                                    setShowConfirm(true);
                                    setRandomString(
                                        (Math.random() + 1)
                                            .toString(36)
                                            .substring(4)
                                    );
                                }}
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 text-white  rounded bg-rose-600 
							transition-all duration-100 ease-linear hover:scale-95"
                                onClick={onClickNo}
                            >
                                No
                            </button>
                        </div>
                    </div>
                    <div
                        className={
                            "flex flex-col items-center justify-center " +
                            (!showConfirm ? " hidden" : "")
                        }
                    >
                        <p className="text-md mb-2">
                            Type these letters and submit to confirm:
                        </p>
                        <p className="text-xl mb-2 select-none">
                            {randomString}
                        </p>
                        <div className="flex flex-wrap">
                            <input
                                ref={inputConfirm}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addCalendar();
                                    }
                                }}
                                className="shadow appearance-none border rounded w-fit h-9 py-1 px-3 text-gray-700 
                                            leading-tight focus:outline-none focus:shadow-outline"
                                type="textfield"
                            />
                            <button
                                className="px-4 py-1.5 mr-7 text-white  rounded bg-rose-600 
							transition-all duration-100 ease-linear hover:scale-95"
                                onClick={confirmDelete}
                            >
                                Confirm
                            </button>
                            <button
                                className="px-4 text-white  rounded bg-rose-600 
							transition-all duration-100 ease-linear hover:scale-95"
                                onClick={() => {
                                    setShowConfirm(false);
                                    onClickNo();
                                }}
                            >
                                cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Dialogue>
        </div>
    );
}

export default OrgUser;
