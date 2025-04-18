function get_user {
    MONGO_URI='mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0'
    mongosh "$MONGO_URI" --quiet --eval "JSON.stringify(db.users.findOne({_id: '${1}'},{__v: 0}))"  || fail
}

function create_user {
    MONGO_URI='mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0'
    mongosh "$MONGO_URI" --quiet  --eval "db.users.replaceOne({_id: '${1}'},$(jq -r "._id = \"${1}\"" /templates/user.json),{upsert: true})" || fail
}

function mongo_dump {
    MONGO_URI='mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0'
    mongosh "$MONGO_URI" --quiet --eval 'JSON.stringify(db.runCommand( { dbHash: 1 } ))' | jq -r '.collections | del(.mongo_events)' || fail
    #| cut -d ' ' -f1 | md5sum | cut -d ' ' -f1
}