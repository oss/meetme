if [ -z $BUILD ]; then
    BUILD='dev'
fi

case $BUILD in
    dev|DEV)
        export API_URL="http://backend:8000"
    ;;
    prod|PROD)
        echo "prod url not set up yet"
        exit 1
        export API_URL=''
    ;;
    *)
        echo 'invalid env const'
        exit 1
    ;;
esac

exec "$@"