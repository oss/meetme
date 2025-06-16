source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

$CR build --file 'testing/docs/Dockerfile' -t meetme-test-docs 'testing/docs/.'
$CR run -v ${PWD}:/project:ro --network host meetme-test-docs
