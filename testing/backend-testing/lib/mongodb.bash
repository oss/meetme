function create_user {
    for netid in $@; do
        echo "$netid"
    done
}

function mongo_dump {    
    echo "$( mongodump --db=meetme --out - --excludeCollection=mongo_events | md5sum | cut -d ' ' -f1 )"
}