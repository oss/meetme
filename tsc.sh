source ./rt.sh
CR=$(check_runtime "$CR") || exit 1

$CR build --file testing/frontend/type_checking/Dockerfile -t tsc-meetme .

$CR run                                                  \
    -v $(pwd)/frontend:/code:ro                             \
    -v $(pwd)/frontend/tsconfig.json:/code/tsconfig.json    \
    tsc-meetme --noEmit
