import Tile from "../utils/tile";
import { Link } from "react-router-dom";

export default function InvitationTile({
    name,
    owner,
    acceptInvite,
    declineInvite,
}: {
    name: string;
    owner: string;
    id: string;
    acceptInvite: () => void;
    declineInvite: () => void;
}) {
    return (
        <div className="h-fit my-1 mr-2 w-full md:w-[30%]">
            <Tile
                title={""}
                extracss={"border-solid border-white"}
                default_margin={false}
                default_padding={true}
                fullHeight={true}
            >
                <div className="flex justify-start items-center w-full h-full">
                    <div className={`bg-white rounded cursor-pointer w-full`}>
                        <p
                            className={
                                "w-full mr-20 text-xl h-fit font-semibold break-words col-span-2 "
                            }
                        >
                            {name}
                        </p>
                        <p className="w-full mr-20 text-sm h-fit font-medium break-words text-slate-500/50 col-span-2">
                            {owner}
                        </p>
                        <div className="flex justify-end mt-2">
                            <button
                                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                                onClick={() => acceptInvite()}
                            >
                                Accept
                            </button>
                            <button
                                className="bg-rutgers_red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                                onClick={() => declineInvite()}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            </Tile>
        </div>
    );
}
