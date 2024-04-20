import Tile from '../../../components/tile';
import { Link } from 'react-router-dom';
import { memo } from 'react';

const OrgTile = memo(function OrgTile({ orgID, orgName }) {
    return (
        <div className='group relative'>
            <Tile>
                <Link to={`/org/${orgID}`} >
                    <div className='bg-white grow'>
                        <div className='border-solid border-white transition-all ease-linear duration-100 group-hover:border-l-8 group-hover:border-red-600'>
                            <p className="text-x font-semibold break-words" >
                                <wbr />
                                {orgName}
                            </p>
                        </div>
                    </div>
                </Link>
            </Tile>
        </div>
    )
});

export default OrgTile;