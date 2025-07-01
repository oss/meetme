source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

#$CR build --file testing/frontend/linter/Dockerfile -t eslint-meetme 'testing/frontend/linter'
#$CR run -v "$PWD/frontend:/root/code:ro" eslint-meetme "$@"

$CR build --file testing/backend/linter/Dockerfile -t eslint-meetme-backend 'testing/backend/linter'
$CR run -v "$PWD/backend:/root/code" eslint-meetme-backend "$@"