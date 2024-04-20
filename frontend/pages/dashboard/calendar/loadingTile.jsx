import { memo } from "react";
import { Link } from "react-router-dom";
import Tile from '../../../components/tile'

const LoadingTile = memo(function LoadingTile({ calendarID }) {
    return (
        <div className='group'>
            <Tile>
                <Link to={"/cal/" + calendarID}>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                        loading...
                    </div>
                </Link>
            </Tile>
        </div>
    )
})

export default LoadingTile;