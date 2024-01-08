# MeetMe

## Summary

All other documentation files are in `./docs`

### Quick Start

1. [Install Docker](https://docs.docker.com/engine/install/)
2. Clone the repository

   ```bash
   git clone git@gitlab.rutgers.edu:MaCS/OSS/meetme.git
   ```

3. Modify your hosts file

   ```bash
   echo "127.0.0.1    localhost.edu
   127.0.0.1    api.localhost.edu
   127.0.0.1    cas.localhost.edu
   127.0.0.1    ldap.localhost.edu
   127.0.0.1    saml.localhost.edu
   127.0.0.1    admin.localhost.edu
   127.0.0.1    idp.localhost.edu" >> /etc/hosts
   ```

4. Build the containers

   ```bash
   ./build.sh
   ```

5. Run meetme

   ```bash
   docker-compose --file Docker-swarm.yml up --build
   ```

### Hotloading

```
./build.sh
docker-compose --file Docker-compose-webpack.yml up
```

### Hosts file

You may have to modify your hosts file which has the path `/etc/hosts` for Linux/MacOS systems or `C:/Windows/System32/Drivers/etc/hosts` on Windows systems.

Add the following lines to your host file

```
127.0.0.1    localhost
127.0.0.1    localhost.edu
127.0.0.1    api.localhost.edu
127.0.0.1    cas.localhost.edu
127.0.0.1    ldap.localhost.edu
127.0.0.1    saml.localhost.edu
127.0.0.1    admin.localhost.edu
127.0.0.1    idp.localhost.edu
```

## Backend

#### Build Options

## Frontend

### Building

Build options are stored as environment variables within the docker container.

#### Build Options

| parameter | values   | description                                                         | default |
| --------- | -------- | ------------------------------------------------------------------- | ------- |
| BUILD     | dev/prod | specifies whether to create a development build or production build | dev     |

### Environment Variables

| name                | type   | description               | example                   |
| ------------------- | ------ | ------------------------- | ------------------------- |
| process.env.API_URL | String | the url to backend domain | https://api.localhost.edu |

## Testing

### Running Tests

- `./run-tests.sh`

### Running linter

```sh
docker build --file testing/frontend/linter/Dockerfile -t eslint-meetme 'testing/frontend/linter'

docker run -v "$PWD/frontend:/root/code" eslint-meetme
```
