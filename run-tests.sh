source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

if [ ! $skip_build ]; then
    $CR build -t meetme-test-suite testing/backend/api || exit 1
    $CR build -t meetme-test-puppeteer testing/puppeteer || exit 1
fi

#./build.sh

#docker-compose --file Docker-swarm.yml up --build -d

$CR run --rm --network meetme_mongo-net mongo mongosh "mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0" --quiet --eval 'db.dropDatabase()'

$CR run \
    --network meetme_mongo-net --network meetme_no-internet --network meetme_authnet \
    meetme-test-suite

#$CR container create meetme-test-suite
#$CR run -i --init --cap-add=SYS_ADMIN ---rm ghcr.io/puppeteer/puppeteer:latest node -e "$(cat getcookie.js)"
#docker-compose --file Docker-swarm.yml down
