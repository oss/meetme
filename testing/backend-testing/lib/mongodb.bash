function get_user {
    MONGO_URI='mongodb://localhost:27017/meetme'
    if [ -v GITLAB_CI ]; then
        MONGO_URI='mongodb://mongo:27017/meetme'
    fi

    mongosh "$MONGO_URI" --quiet --eval "JSON.stringify(db.users.findOne({_id: '${1}'},{__v: 0}))"  || fail
}

function create_user {
    MONGO_URI='mongodb://localhost:27017/meetme'
    if [ -v GITLAB_CI ]; then
        MONGO_URI='mongodb://mongo:27017/meetme'
    fi

    mongosh meetme "$MONGO_URI" --quiet  --eval "db.users.replaceOne({_id: '${1}'},$(jq -r "._id = \"${1}\"" /templates/user.json),{upsert: true})" || fail
}

function mongo_dump {
    temp_dir=$(mktemp -d)
    MONGO_URI='mongodb://localhost:27017/meetme'
    if [ -v GITLAB_CI ]; then
        MONGO_URI='mongodb://mongo:27017/meetme'
    fi
    echo "$( mongodump --db=meetme --uri "$MONGO_URI" --out $temp_dir --excludeCollection=mongo_events 2> /dev/null && find $temp_dir -type f -print | xargs md5sum | cut -d ' ' -f1 )" || fail
    #| cut -d ' ' -f1 | md5sum | cut -d ' ' -f1
    rm -rf $temp_dir
}