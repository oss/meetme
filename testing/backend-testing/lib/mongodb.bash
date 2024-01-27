function create_user {
    for netid in $@; do
        echo "$netid"
    done
}

function mongo_dump {
    user_dump=$(mongosh meetme --quiet --eval 'db.users.find({})' | md5sum | cut -d ' ' -f1 & )
    cal_main_dump=$(mongosh meetme --quiet --eval 'db.calendar_mains.find({})' | md5sum | cut -d ' ' -f1 & )
    cal_meta_dump=$(mongosh meetme --quiet --eval 'db.calendar_metas.find({})' | md5sum | cut -d ' ' -f1 & )
    cal_org_dump=$(mongosh meetme --quiet --eval 'db.organizations.find({})' | md5sum | cut -d ' ' -f1 & )
    wait
    
    echo "${user_dump}${cal_main_dump}${cal_meta_dump}${cal_org_dump}" | md5sum | cut -d ' ' -f1
}