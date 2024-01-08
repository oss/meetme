source /root/env

if [[ $TARGET_IND_CAL ]]; then
    echo -e "\e[34mRunning individual cal tests with calID:\033[1m $TARGET_IND_CAL\e[0m"
else
    echo "cannot find individual calendar ID in env"
    exit 1
fi

if [[ $TARGET_ORG ]]; then
    echo -e "\e[34mRunning organization tests with orgID:\033[1m $TARGET_ORG\e[0m"
else
    echo "cannot find org ID in env"
    exit 1
fi