#!/bin/sh

./mongodb_exporter --mongodb.uri=mongodb://127.0.0.1:27017 --discovering-mode --compatible-mode=true --collect-all &

rm /var/run/external/exporter.sock
socat UNIX-LISTEN:/var/run/external/exporter.sock,fork TCP:127.0.0.1:9216 &

./initrs.sh &

exec mongod --bind_ip_all --replSet rs0