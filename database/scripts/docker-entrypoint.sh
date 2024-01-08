./mongodb_exporter --mongodb.uri=mongodb://127.0.0.1:27017 --discovering-mode --compatible-mode=true --collect-all &
mongod --bind_ip_all --replSet rs0