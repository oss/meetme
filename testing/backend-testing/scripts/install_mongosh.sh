distro="deb" #weird mongo stuff
arch=$(dpkg --print-architecture)
MONGO_TARGET=$(. /etc/os-release && echo "${ID}${VERSION_ID}")


MONGOSH_INSTALL=$(curl https://downloads.mongodb.com/compass/mongosh.json | jq -r --arg arch "${arch}" --arg distro "${distro}" --arg target "${MONGO_TARGET}" \
    '.versions[0].downloads[] | select (.arch==$arch and .distro==$distro and .targets[] == $target and .sharedOpenssl == null ) | .archive.url' )

curl "$MONGOSH_INSTALL" -o mongosh.deb
dpkg -i mongosh.deb