function get_user {
    mongosh meetme --quiet --eval "JSON.stringify(db.users.findOne({_id: '${1}'},{__v: 0}))" || fail
}

function create_user {
    mongosh meetme --quiet --eval "db.users.replaceOne({_id: '${1}'},$(jq -r "._id = \"${1}\"" /templates/user.json),{upsert: true})" || fail
}

function mongo_dump {
    temp_dir=$(mktemp -d)
    MONGO_URI='mongodb://localhost:27017/meetme?replicaSet=rs0'
    if [ -z ${GITLAB_CI} ]; then
        MONGO_URI='mongodb://mongo:27017/meetme?replicaSet=rs0'
    fi
    echo "$( mongodump --db=meetme --uri "$MONGO_URI" --out $temp_dir --excludeCollection=mongo_events 2> /dev/null && find $temp_dir -type f -print | xargs md5sum | cut -d ' ' -f1 | md5sum | cut -d ' ' -f1)" || fail
    rm -rf $temp_dir
}