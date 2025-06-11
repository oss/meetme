#!/bin/sh

#find . -name "/docker-entrypoint.d/*.sh" -type f -print0 | xargs -0 -I % chmod +x '%' && /bin/sh '%' &
/bin/sh /docker-entrypoint.d/create_useragent_pipeline.sh &

exec /bin/sh /usr/share/opensearch/opensearch-docker-entrypoint.sh opensearch