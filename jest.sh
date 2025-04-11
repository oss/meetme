docker build --file 'testing/frontend/jest/Dockerfile' -t meetme-jest 'testing/frontend/jest/.'
docker run -v $(pwd):/root/work meetme-jest -v $(pwd)/frontend/package.json:/root/work/frontend/package.json:ro
