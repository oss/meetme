docker build --file testing/frontend/linter/Dockerfile -t eslint-meetme 'testing/frontend/linter'
docker run -v "$PWD/frontend:/root/code:ro" eslint-meetme $@