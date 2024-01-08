import { Link } from "react-router-dom";
import { getUser } from "../../utils";
import { useState } from "react";
import { popupOptions } from "./popup-manager";
import DropdownMenu from "../utils/dropdown-menu";
import uniqid from "uniqid";
import Tile from "../utils/tile";
import PopupManager from "./popup-manager";

export default function MeetingTile({
    metadata,
    isTileLayout = false,
}: {
    metadata: any;
    isTileLayout?: boolean;
}) {
    const [popupSelection, setPopupSelection] = useState<popupOptions>("none");
    function getDropdownMenu() {
        return (
            <DropdownMenu
                menuItems={[
                    "Rename",
                    getUser().uid == metadata.owner._id ? "Delete" : "Leave",
                ]}
                menuItemFunctions={[
                    () => {
                        setPopupSelection("rename");
                    },
                    getUser().uid == metadata.owner._id
                        ? () => {
                              setPopupSelection("delete");
                          }
                        : () => {
                              setPopupSelection("leave");
                          },
                ]}
            />
        );
    }

    return (
        <div
            className={`h-fit my-1 ${
                isTileLayout ? "mr-2 w-full md:w-[30%]" : "w-full"
            }`}
        >
            <PopupManager
                popupSelection={popupSelection}
                setPopupSelection={setPopupSelection}
                calendarID={metadata._id}
            />
            <Link to={"/cal/" + metadata._id}>
                <Tile
                    title={""}
                    extracss={
                        "border-solid border-white transition-all ease-linear duration-100 hover:border-l-8 hover:border-red-600" +
                        (isTileLayout ? " relative" : "")
                    }
                    default_margin={false}
                    default_padding={isTileLayout}
                    fullHeight={true}
                >
                    <div
                        className="flex justify-start items-center w-full h-full"
                        key={uniqid()}
                    >
                        <div
                            className={`${
                                isTileLayout
                                    ? ""
                                    : "w-full p-3 grid grid-cols-7"
                            } bg-white rounded cursor-pointer ${
                                isTileLayout ? "" : "flex justify-start"
                            }`}
                        >
                            <p
                                className={
                                    "w-full mr-20 text-xl h-fit font-semibold break-words col-span-2 "
                                }
                            >
                                {metadata.name}
                            </p>
                            <p className="w-full mr-20 text-sm h-fit font-medium break-words text-slate-500/50 col-span-2">
                                {metadata.owner._id}
                            </p>
                            <p
                                className={
                                    "w-full mr-20 break-words col-span-2 " +
                                    (metadata.location == null
                                        ? "text-gray-300"
                                        : "text-slate-500/50 font-semibold")
                                }
                            >
                                {metadata.location == null
                                    ? "-"
                                    : metadata.location}
                            </p>
                            {isTileLayout ? "" : getDropdownMenu()}
                        </div>
                        {isTileLayout ? (
                            <div className="w-fit h-fit position absolute right-0 top-0 p-2">
                                {getDropdownMenu()}
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </Tile>
            </Link>
        </div>
    );
}
