source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

$CR build --file 'testing/frontend/jest/Dockerfile' -t meetme-jest 'testing/frontend/jest/.' || exit 1
$CR run -v $(pwd):/root/work:ro meetme-jest "$@"
