CERT_DIR='/usr/share/opensearch/config/certificates'
CURL_CMD="curl --cacert $CERT_DIR/ca/ca.pem --cert $CERT_DIR/ca/admin.pem --key $CERT_DIR/ca/admin.key"

wait_for_opensearch_boot() {
    while ! $($CURL_CMD https://localhost:9200 > /dev/null 2>/dev/null); do
        echo "opensearch not ready... waiting..."
        sleep 0.1
    done
    $CURL_CMD https://localhost:9200
}

wait_for_opensearch_boot;


$CURL_CMD -H 'Content-Type: application/json' -X PUT https://localhost:9200/_ingest/pipeline/user_agent_pipeline \
    --data "$(jq -rn --arg allow_string 'ctx.user_agent != null' '{
  "description": "User agent pipeline",
  "processors": [
    {
      "user_agent": {
        "field": "user_agent",
        "target_field": "user_agent_info",
        "if": $allow_string
      }
    }
  ]
}')" || kill -9 1