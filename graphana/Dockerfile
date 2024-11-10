FROM node:20 as build-chloropleth-plugin
COPY plugin_test/rutgersoss-choropleth-panel /src
WORKDIR /src
RUN npm install . && npm run build --loglevel verbose --force

FROM grafana/grafana
ENV GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=rutgersoss-choropleth-panel
RUN grafana-cli plugins install grafana-opensearch-datasource
COPY --from=build-chloropleth-plugin /src/dist/ /var/lib/grafana/plugins/rutgersoss-choropleth-panel
COPY provisioning/ /etc/grafana/provisioning