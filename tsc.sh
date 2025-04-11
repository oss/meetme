docker build --file testing/frontend/type_checking/Dockerfile -t tsc-meetme .

docker run                                                  \
    -v $(pwd)/frontend:/code:ro                             \
    -v $(pwd)/frontend/tsconfig.json:/code/tsconfig.json    \
    tsc-meetme --noEmit