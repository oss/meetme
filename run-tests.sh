if [ ! $skip_build ]; then
    docker build -t meetme-test-suite testing/backend-testing || exit 1
    docker build -t meetme-test-puppeteer testing/puppeteer || exit 1
fi

#./build.sh

#docker-compose --file Docker-swarm.yml up --build -d
curl -sSk 'https://api.localhost.edu/clear_db' > /dev/null

docker run --rm --network host mongo mongosh meetme --quiet --eval 'db.dropDatabase()'

docker run --rm --network host mongo mongosh meetme --quiet --eval 'db.createCollection("users")'
docker run --rm --network host mongo mongosh meetme --quiet --eval 'db.createCollection("calendar_mains")'
docker run --rm --network host mongo mongosh meetme --quiet --eval 'db.createCollection("calendar_metas")'
docker run --rm --network host mongo mongosh meetme --quiet --eval 'db.createCollection("organizations")'

COOKIE_NETID1=""
COOKIE_NETID2=""
COOKIE_NETID3=""
COOKIE_NETID4=""
COOKIE_NETID5=""
COOKIE_NETID6=""

while [ -z "$COOKIE_NETID1" ]; do
    COOKIE_NETID1=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid1 rutgers1);
    if [ -z "$COOKIE_NETID1" ]; then
        echo "ERROR: Could not get cookie for netid1, retrying..."
    else
        echo "successfully got cookie for netid1"
    fi
done

while [ -z "$COOKIE_NETID2" ]; do
    COOKIE_NETID2=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid2 rutgers2);
    if [ -z "$COOKIE_NETID2" ]; then
        echo "ERROR: Could not get cookie for netid2, retrying..."
    else
        echo "successfully got cookie for netid2"
    fi
done

docker run \
    -e COOKIE_NETID1="$COOKIE_NETID1" \
    -e COOKIE_NETID2="$COOKIE_NETID2" \
    -e COOKIE_NETID3="$COOKIE_NETID3" \
    -e COOKIE_NETID4="$COOKIE_NETID4" \
    -e COOKIE_NETID5="$COOKIE_NETID5" \
    -e COOKIE_NETID6="$COOKIE_NETID6" \
    --network host \
    meetme-test-suite

#docker container create meetme-test-suite
#docker run -i --init --cap-add=SYS_ADMIN ---rm ghcr.io/puppeteer/puppeteer:latest node -e "$(cat getcookie.js)"
#docker-compose --file Docker-swarm.yml down