function get_user {
    mongosh meetme --quiet --eval "JSON.stringify(db.users.findOne({_id: '${1}'},{__v: 0}))"
}

function create_user {
    mongosh meetme --quiet --eval "db.users.replaceOne({_id: '${1}'},$(jq -r "._id = \"${1}\"" /templates/user.json),{upsert: true})"
}

function mongo_dump {
    echo "$( mongodump --db=meetme --out - --excludeCollection=mongo_events | md5sum | cut -d ' ' -f1 )"
}