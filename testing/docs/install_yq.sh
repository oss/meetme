URL='https://github.com/mikefarah/yq/releases/download/'
VERSION='v4.44.1'
BINARY="yq_linux_$(dpkg --print-architecture)"

wget ${URL}${VERSION}/${BINARY}.tar.gz -O - | tar xz && mv ${BINARY} /usr/bin/yq