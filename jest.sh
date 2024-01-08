docker build --file 'testing/frontend/jest/Dockerfile' -t meetme-jest 'testing/frontend/jest/.'
docker run -v $(PWD):/root/work meetme-jest
