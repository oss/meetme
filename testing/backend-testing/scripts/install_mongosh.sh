distro="deb" #weird mongo stuff

arch_1=$(uname -m)
arch_2=$(dpkg --print-architecture)

MONGO_TARGET=$(. /etc/os-release && echo "${ID}${VERSION_ID}")

curl https://downloads.mongodb.com/compass/mongosh.json > response.json

MONGOSH_INSTALL_URL=$(jq -r --arg arch "${arch_1}" --arg distro "${distro}" --arg target "${MONGO_TARGET}" \
    '.versions[0].downloads[] | select (.arch==$arch and .distro==$distro and .targets[] == $target and .sharedOpenssl == null ) ' response.json)

# .archive.url
if [ -z "$MONGOSH_INSTALL_URL" ]]; then
   MONGOSH_INSTALL_URL=$(jq -r --arg arch "${arch_2}" --arg distro "${distro}" --arg target "${MONGO_TARGET}" \
    '.versions[0].downloads[] | select (.arch==$arch and .distro==$distro and .targets[] == $target and .sharedOpenssl == null )' response.json)
fi

MONGOSH_INSTALL_URL="$(jq -rn --argjson x "${MONGOSH_INSTALL_URL}" '$x.archive.url')"
echo "installing .deb file from ${MONGOSH_INSTALL_URL}"

curl "$MONGOSH_INSTALL_URL" -o mongosh.deb
dpkg -i mongosh.deb