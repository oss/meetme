EXE='webpack'

if [ -z $BUILD ]; then
    BUILD='dev'
fi

params=''

case $BUILD in
    dev|DEV)
        params="$params--mode development "
        params="$params--stats verbose "
        export BUILD='dev'
        export API_URL='https://api.localhost.edu'
    ;;
    prod|PROD)
        params="$params--mode production "
        params="$params--config webpack.dev.js "
        export BUILD='prod'
        export API_URL='https://api.localhost.edu'
    ;;
    *)
        echo 'invalid build env'
        exit 1
    ;;
esac

npx tailwindcss -i ./input.css -o index.css

if [ $BUILD = "dev" ]; then
    echo "starting build"
    npx $EXE $params | tee /root/webpack.output
else
    npx $EXE $params | tee /root/webpack.output
fi
