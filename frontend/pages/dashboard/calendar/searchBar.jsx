import filterStore from '@store/filterStore';
import {useRef} from 'react';

function searchBar() {

    const setCalSearch = filterStore((store) => store.setCalSearch);
    const setOrgSearch = filterStore((store) => store.setOrgSearch);

    const selectedIndex = filterStore((store) => store.selectedIndex);

    const calSearchInputRef = useRef(null);
    const orgSearchInputRef = useRef(null);

    function validateCalSearch() {
        setCalSearch(calSearchInputRef.current.value);
    }

    function validateOrgSearch() {
        setOrgSearch(orgSearchInputRef.current.value);
    }

    return (<div className = "my-2 md:w-1/5">
                {
                selectedIndex === 0
                ?
                <input type="text" className="w-full h-full bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none  focus:border-rutgers_red"
                                    placeholder='Search'
                                    onChange={validateCalSearch}
                                    ref={calSearchInputRef}
                />
                :                
                <input type="text" className="w-full h-full bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none  focus:border-rutgers_red"
                                    placeholder='Search'
                                    onChange={validateOrgSearch}
                                    ref={orgSearchInputRef}
                />
                }
            </div>
    )
}

export default searchBar;