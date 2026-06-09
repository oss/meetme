import { memo } from "react";
import Tile from "@primitives/tile";
import { Link } from "react-router-dom";

const LoadingTile = memo(function LoadingTile({ orgID }) {
    return (
        <div className='group'>
            <Tile>
                <Link to={"/org/" + orgID}>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                        loading...
                    </div>
                </Link>
            </Tile>
        </div>
    )
})

export default LoadingTile;