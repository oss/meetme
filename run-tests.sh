if [ ! $skip_build ]; then
    docker build -t meetme-test-suite testing/backend-testing
    docker build -t meetme-test-puppeteer testing/puppeteer
fi

#./build.sh

#docker-compose --file Docker-swarm.yml up --build -d
curl -sSk 'https://api.localhost.edu/clear_db' > /dev/null
if [ $? -ne 0 ]; then
    echo "was unable to reset database"
    exit 1;
fi

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

while [ -z "$COOKIE_NETID3" ]; do
    COOKIE_NETID3=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid3 rutgers3);
    if [ -z "$COOKIE_NETID3" ]; then
        echo "ERROR: Could not get cookie for netid3, retrying..."
    else
        echo "successfully got cookie for netid3"
    fi
done

while [ -z "$COOKIE_NETID4" ]; do
    COOKIE_NETID4=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid4 rutgers4);
    if [ -z "$COOKIE_NETID4" ]; then
        echo "ERROR: Could not get cookie for netid4, retrying..."
    else
        echo "successfully got cookie for netid4"
    fi
done


while [ -z "$COOKIE_NETID5" ]; do
    COOKIE_NETID5=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid5 rutgers5);
    if [ -z "$COOKIE_NETID5" ]; then
        echo "ERROR: Could not get cookie for netid5, retrying..."
    else
        echo "successfully got cookie for netid5"
    fi
done

while [ -z "$COOKIE_NETID6" ]; do
    COOKIE_NETID6=$(docker run --rm --network host meetme-test-puppeteer node getcookie.js netid6 rutgers6);
    if [ -z "$COOKIE_NETID6" ]; then
        echo "ERROR: Could not get cookie for netid6, retrying..."
    else
        echo "successfully got cookie for netid6"
    fi
done

curl -sSk 'https://api.localhost.edu/test/delete_user/netid6' > /dev/null
if [ $? -ne 0 ]; then
    echo "was unable to remove user data"
    exit 1;
fi

curl -sSk 'https://api.localhost.edu/test/delete_user/netid5' > /dev/null
curl -sSk 'https://api.localhost.edu/test/delete_user/netid4' > /dev/null
curl -sSk 'https://api.localhost.edu/test/delete_user/netid3' > /dev/null
curl -sSk 'https://api.localhost.edu/test/delete_user/netid2' > /dev/null
#COOKIE_NETID3=$(docker run --network host meetme-test-puppeteer node getcookie.js netid3 rutgers3)

docker run --rm \
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