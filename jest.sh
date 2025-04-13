docker build --file 'testing/frontend/jest/Dockerfile' -t meetme-jest 'testing/frontend/jest/.' || exit 1
docker run -v $(pwd):/root/work:ro meetme-jest "$@"
