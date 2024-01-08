import { Link } from "react-router-dom";
import Tile from "../utils/tile";
import uniqid from "uniqid";

export default function OrgTile({
    isTileLayout,
    orgData,
}: {
    isTileLayout: boolean;
    orgData: any;
}) {
    return (
        <div
            className={`h-fit my-1 ${
                isTileLayout ? "mr-2 w-full md:w-[30%]" : "w-full"
            }`}
        >
            <Link to={"/org/" + orgData._id}>
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
                                {orgData.name}
                            </p>
                            <p className="w-full mr-20 text-sm h-fit font-medium break-words text-slate-500/50 col-span-2">
                                {orgData.owner}
                            </p>
                            <p className="w-full mr-20 break-words col-span-2 text-slate-500/50 font-semibold">
                                {orgData.members.length}
                            </p>
                        </div>
                    </div>
                </Tile>
            </Link>
        </div>
    );
}
