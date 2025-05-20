./mongodb_exporter --mongodb.uri=mongodb://127.0.0.1:27017 --discovering-mode --compatible-mode=true --collect-all &
socat UNIX-LISTEN:/var/run/external/exporter.sock,fork TCP:127.0.0.1:9216 &
mongod --bind_ip_all --replSet rs0