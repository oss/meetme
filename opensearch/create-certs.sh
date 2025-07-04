#!/bin/bash
# Generate certificates for your OpenSearch cluster

OPENDISTRO_DN="/C=FR/ST=IDF/L=PARIS/O=EXAMPLE"   # Edit here and in opensearch.yml

mkdir -p certs/{ca,grafana,fluent-bit}

# Root CA
openssl genrsa -out certs/ca/ca.key 2048
openssl req -new -x509 -sha256 -days 9999 -subj "$OPENDISTRO_DN/CN=CA" -key certs/ca/ca.key -out certs/ca/ca.pem

# Admin
openssl genrsa -out certs/ca/admin-temp.key 2048
openssl pkcs8 -inform PEM -outform PEM -in certs/ca/admin-temp.key -topk8 -nocrypt -v1 PBE-SHA1-3DES -out certs/ca/admin.key
openssl req -new -subj "$OPENDISTRO_DN/CN=ADMIN" -key certs/ca/admin.key -out certs/ca/admin.csr
openssl x509 -req -in certs/ca/admin.csr -CA certs/ca/ca.pem -CAkey certs/ca/ca.key -CAcreateserial -sha256 -out certs/ca/admin.pem -days 9999

# Grafana Dashboards
openssl genrsa -out certs/grafana/grafana-temp.key 2048
openssl pkcs8 -inform PEM -outform PEM -in certs/grafana/grafana-temp.key -topk8 -nocrypt -v1 PBE-SHA1-3DES -out certs/grafana/grafana.key
openssl req -new -subj "$OPENDISTRO_DN/CN=grafana" -key certs/grafana/grafana.key -out certs/grafana/grafana.csr
openssl x509 -req -in certs/grafana/grafana.csr -CA certs/ca/ca.pem -CAkey certs/ca/ca.key -CAcreateserial -sha256 -out certs/grafana/grafana.pem -days 9999
rm certs/grafana/grafana-temp.key certs/grafana/grafana.csr

# Fluentbit 
openssl genrsa -out certs/fluent-bit/fluent-bit-temp.key 2048
openssl pkcs8 -inform PEM -outform PEM -in certs/fluent-bit/fluent-bit-temp.key -topk8 -nocrypt -v1 PBE-SHA1-3DES -out certs/fluent-bit/fluent-bit.key
openssl req -new -subj "$OPENDISTRO_DN/CN=fluent-bit" -key certs/fluent-bit/fluent-bit.key -out certs/fluent-bit/fluent-bit.csr
openssl x509 -req -in certs/fluent-bit/fluent-bit.csr -CA certs/ca/ca.pem -CAkey certs/ca/ca.key -CAcreateserial -sha256 -out certs/fluent-bit/fluent-bit.pem -days 9999
rm certs/fluent-bit/fluent-bit-temp.key certs/fluent-bit/fluent-bit.csr


# Nodes
for NODE_NAME in "os01"
do
    mkdir "certs/${NODE_NAME}"
    openssl genrsa -out "certs/$NODE_NAME/$NODE_NAME-temp.key" 2048
    openssl pkcs8 -inform PEM -outform PEM -in "certs/$NODE_NAME/$NODE_NAME-temp.key" -topk8 -nocrypt -v1 PBE-SHA1-3DES -out "certs/$NODE_NAME/$NODE_NAME.key"
    openssl req -new -subj "$OPENDISTRO_DN/CN=$NODE_NAME" -key "certs/$NODE_NAME/$NODE_NAME.key" -out "certs/$NODE_NAME/$NODE_NAME.csr"
    openssl x509 -req -extfile <(printf "subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:$NODE_NAME") -in "certs/$NODE_NAME/$NODE_NAME.csr" -CA certs/ca/ca.pem -CAkey certs/ca/ca.key -CAcreateserial -sha256 -out "certs/$NODE_NAME/$NODE_NAME.pem" -days 9999
    rm "certs/$NODE_NAME/$NODE_NAME-temp.key" "certs/$NODE_NAME/$NODE_NAME.csr"
done

chmod -R 750 ./certs
chown -R $USER:1000 ./certs