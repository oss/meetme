import Tile from '@primitives/tile';
import { Link } from 'react-router-dom';
import { memo } from 'react';

const OrgTile = memo(function OrgTile({ orgID, orgName }) {
    return (
        <Tile>
            <Link to={`/org/${orgID}`} >
                <div className='bg-white grow group'>
                    <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                        <div className = "w-full p-4 bg-white rounded cursor-pointer">
                            <p className="text-x font-semibold break-words" >
                                <wbr />
                                {orgName}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </Tile>
    )
});

export default OrgTile;