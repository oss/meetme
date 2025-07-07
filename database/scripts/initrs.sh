wait_for_mongo_to_boot() {
    while ! $(mongosh --eval 'db.version()' > /dev/null 2>/dev/null); do
        echo "mogno not ready... waiting..."
        sleep 0.1
    done
    echo "mongo version $(mongosh --eval 'db.version()') is ready..."
}

create_rs() {
    echo "creating mongo replica set..."
    mongosh --host mongo:27017 --eval 'rs.initiate({ "_id" : "rs0", "members" : [{
        "_id" : 0,
        "host" : "mongo:27017",
        "priority": 5
        },
        {
            "_id" : 1,
            "host" : "mongo-jr:27017",
            "priority": 1
        },
        {
            "_id" : 2,
            "host" : "mongo-the-third:27017",
            "priority": 1
        }]
    });'
}


wait_for_mongo_to_boot;

mongosh --eval 'rs.status()' || create_rs 