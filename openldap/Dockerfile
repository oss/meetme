FROM debian:11

ENV DEBIAN_FRONTEND=noninteractive

EXPOSE 1389

WORKDIR /root
COPY . .

# Installing openldap prompts for a password, so we pre-seed the
# selection to "adminpassword" for non-interactive install
RUN <<EOF
cat <<DEB_EOF | debconf-set-selections
slapd slapd/password1 password adminpassword
slapd slapd/password2 password adminpassword
slapd slapd/domain string example.org
slapd slapd/backend select MDB
slapd slapd/no_configuration boolean false
DEB_EOF

apt-get update -y
apt-get upgrade -y
apt-get install slapd ldap-utils -y
EOF

CMD ./entrypoint.sh
