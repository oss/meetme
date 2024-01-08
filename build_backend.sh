GIT_BRANCH=$(cat .git/FETCH_HEAD | grep -v 'not-for-merge' | sed -r "s/.*branch \'(.*)\'.*/\1/g") || exit 1
GIT_HASH=$(cat .git/FETCH_HEAD | grep -v 'not-for-merge' | sed -r "s/\t\tbranch.*//g") || exit 1
docker build 'backend/.' -t backend-meetme --build-arg GIT_BRANCH="$GIT_BRANCH" --build-arg GIT_HASH="$GIT_HASH" --build-arg DEV="true" --build-arg LOGIN_URL='https://idp.localhost.edu:4443/idp/profile/SAML2/Redirect/SSO' || exit 1
