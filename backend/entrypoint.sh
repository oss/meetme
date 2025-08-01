#!/usr/bin/env sh

check() {
	jq -e "$2" < "$1" > /dev/null
}

die() {
	echo "$1"
	exit 1
}

# run prod checks to ensure we are not running with unconfigured (default dev)
# settings
if [ "$PROD" = "YES" ]; then
	# remove comments
	stripped=$(json5 ./config.json5 | jq -r '.')

	# check config.json5
	check "$stripped" '.frontend_domain=="https://localhost.edu"' && die "frontend_domain is still set to localhost, please change it!"
	check "$stripped" '.backend_domain=="https://api.localhost.edu"' && die "backend_domain is still set to localhost, please change it!"
	check "$stripped" '.auth.cookie_domain==".localhost.edu"' && die "cookie_domain is still set to localhost, please change it!"
	check "$stripped" '.auth.issuer=="https://api.localhost.edu/shibboleth"' && die "issuer is still set to localhost, please change it!"
	check "$stripped" '.auth.login_url=="https://idp.localhost.edu:4443/idp/profile/SAML2/Redirect/SSO"' && die "login_url is still set to localhost, please change it!"

	# check ldap_credential
	ldap_path=$(jq '.ldap.password_file' < "$stripped")
	if [ "$(cat "$ldap_path")" = "adminpassword" ]; then
		die "ldap password is still 'adminpassword', please change it!"
	fi

	# check keygrip
	keygrip_path=$(jq '.auth.keygrip_secret_file' < "$stripped")
	if [ "$(jq -c < "$keygrip_path")" = '["secret1","secret2"]' ]; then
		die "keygrip is still unconfigured!"
	fi

	# check certs to see if they are still the default
	idp_path=$(jq '.auth.idp_cert' < "$stripped")
	if [ "$(sha1sum "$idp_path" | cut -f 1 -d ' ')" = "$(jq '.IDP_SHA' < ./build.json )" ]; then
		die "using dev certificates for ${idp_path}, please change them!"
	fi

	key_path=$(jq '.auth.shib_key.private' < "$stripped")
	if [ "$(sha1sum "$key_path" | cut -f 1 -d ' ')" = "$(jq '.KEY_SHA' < ./build.json )" ]; then
		die "using dev certificates for ${key_path}, please change them!"
	fi

	cert_path=$(jq '.auth.shub_key.public' < "$stripped")
	if [ "$(sha1sum "$cert_path" | cut -f 1 -d ' ')" = "$(jq '.CERT_SHA' < ./build.json )" ]; then
		die "using dev certificates for ${cert_path}, please change them!"
	fi
fi

node main.js
