docker build --file 'docs/Dockerfile' -t docs-meetme 'docs/.' || exit 1
#docker build --file 'jsdoc/Dockerfile' -t jsdoc-meetme 'jsdoc/.' || exit 1
docker run -v "$PWD/docs":"/root" -p 8000:8000 docs-meetme build
docker run -v "$PWD/docs":"/root" -p 8000:8000 docs-meetme serve -a 0.0.0.0:8000
#docker run -v "$PWD/backend":"/code" -v "$PWD/jsdoc/out":"/out" jsdoc-meetme