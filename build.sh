echo "running builds"

docker build 'prometheus/.' -t prometheus-oss-meetme || exit 1
docker build 'proxy/.' -t nginx-oss-meetme || exit 1
docker build 'proxy-ssl-upgrade/.' -t nginx-ssl-oss-meetme || exit 1
docker build 'proxy-internal/.' -t nginx-internal-oss-meetme || exit 1


docker build 'proxy-docker/.' -t nginx-oss-docker || exit 1

GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD) || exit 1
GIT_HASH=$(git rev-parse HEAD) || exit 1
docker build 'backend/.' -t backend-meetme --build-arg GIT_BRANCH="$GIT_BRANCH" --build-arg GIT_HASH="$GIT_HASH" --build-arg DEV="true" --build-arg LOGIN_URL='https://idp.localhost.edu:4443/idp/profile/SAML2/Redirect/SSO' || exit 1
docker build 'frontend/.' -t frontend-meetme --build-arg BUILD="prod" || exit 1
docker build 'graphana/.' -t graphana-oss-meetme || exit 1
docker build 'database/.' -t database-meetme || exit 1
docker build 'websocket/.' -t websocket-meetme || exit 1
docker build --file 'frontend/webpack.Dockerfile' -t frontend-meetme-webpack 'frontend/.' || exit 1
#docker build --file 'shibboleth/Dockerfile' -t shibboleth-idp-meetme 'shibboleth/.' || exit 1
docker build --file 'shib-idp/Dockerfile' -t shibboleth-idp-meetme 'shib-idp/.' || exit 1
#docker build --file 'mkdocs/Dockerfile' -t docs-meetme 'mkdocs/.' || exit 1
docker build --file 'filebeat/Dockerfile' -t filebeat-meetme 'filebeat/.' || exit 1