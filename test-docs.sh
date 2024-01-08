docker build --file 'testing/docs/Dockerfile' -t meetme-test-docs 'testing/docs/.'
docker run -v ${PWD}:/project:ro --network host meetme-test-docs