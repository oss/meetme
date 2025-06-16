source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

$CR build --file testing/frontend/linter/Dockerfile -t eslint-meetme 'testing/frontend/linter'
$CR run -v "$PWD/frontend:/root/code:ro" eslint-meetme "$@"
