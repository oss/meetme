source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

$CR build --file 'docs/Dockerfile' -t docs-meetme 'docs/.' || exit 1
#$CR build --file 'jsdoc/Dockerfile' -t jsdoc-meetme 'jsdoc/.' || exit 1
$CR run -v "$PWD/docs":"/root" -p 8000:8000 docs-meetme build
$CR run -v "$PWD/docs":"/root" -p 8000:8000 docs-meetme serve -a 0.0.0.0:8000
#$CR run -v "$PWD/backend":"/code" -v "$PWD/jsdoc/out":"/out" jsdoc-meetme
