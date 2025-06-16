source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

GIT_BRANCH=$(grep -v 'not-for-merge' .git/FETCH_HEAD | sed -r "s/.*branch \'(.*)\'.*/\1/g") || exit 1
GIT_HASH=$(grep -v 'not-for-merge' .git/FETCH_HEAD | sed -r "s/\t\tbranch.*//g") || exit 1
$CR build 'backend/.' -t backend-meetme --build-arg GIT_BRANCH="$GIT_BRANCH" --build-arg GIT_HASH="$GIT_HASH" --build-arg DEV="true" --build-arg LOGIN_URL='https://idp.localhost.edu:4443/idp/profile/SAML2/Redirect/SSO' || exit 1
