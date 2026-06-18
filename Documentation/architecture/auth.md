
## Shibboleth

Shibboleth is the IDP meetme which uses SAML and is (currently) the only way to login to the service. It uses metadata files which contain the attributes (user data) that are released to the service along with a X509 cert from both the IDP and the service provider (us). A good overview of the SAML workflow can be found on [okta's blog](https://developer.okta.com/docs/concepts/saml/#plan-for-saml).

- The metadata file for the meetme backend can be found in `backend/auth/shibboleth/metadata.xml`. The location for the metadata file inside the container (which is not changable) is `/etc/meetme/security/shibboleth_metadata.xml`. This in theory could be anything as we only need the public/private keypair to authenticate, but should be the appropriate metadata file which shibboleth uses.

- The service provider key should be found in `backend/security/private/key.pem` and the coresponding public key should be found in `backend/security/cert.pem`.

    !!! note "The keys and certs have different locations inside the container"
        The location for the key + cert are set in `/etc/meetme/config.json5`. The default locations are `/root/security/cert.pem` and `/security/private/key.pem`. These _**SHOULD**_ be changed to `/etc/meetme/*` when running as production.

### Important files

All of the notable files related to configuation can be found in `shib-idp/config/shib-idp`. In depth configuration can be found on the [shibboleth confluence page](https://shibboleth.atlassian.net/wiki/spaces/IDP5/pages/3199501666/Configuration) but the most relevant files/directories are...

- `shib-idp/config/shib-idp/metadata/*` stores all relevant metadata files for authentication. These _MUST_ be accurate as this is what shibboleth will use when handling all SSO stuff.

- `shib-idp/config/shib-idp/idp.properties` is the configuration for the whole app. This probably shouldn't be updated too much, but if anything needs to be re-configured, there are lots of comments to explain everything.

- `shib-idp/config/shib-idp/ldap.properties` is the configuration file for shibboleth to communicate with the openldap container. You may need to change things in this file if you change anything in LDAP.

- `shib-idp/config/shib-idp/attribute-resolver.xml` maps values from ldap to an actual SAML attribute. You will need to modify this file if you want to release new attributes from LDAP.

- `shib-idp/config/shib-idp/attribute-filter.xml` tells what attributes to release for each service. You will need to modify this file if you want ot release new attributes from LDAP.

### Adding a new SAML Attribute to Shibboleth

1. Add the attribute to each of the users the `ldaptest/bootstrap.ldif` file

2. Add the attribute to the test heredoc in `testing/backend/api/lib/ldap.bash`

3. Add the attribute to the backend in `backend/main.js` in the `samlStrategy` object. You just need to know the oid which can be found [here](https://www.rfc-editor.org/rfc/rfc4519) if it is a common attribute, or [here](https://wiki.refeds.org/display/STAN/eduPerson) if it is from the eduperson schema.

4. Update any stuff related to the database as needed

5. Add the attribute to the attribute resolver located at `shib-idp/config/shib-idp/attribute-resolver.xml`. The `attributeNames` is the name inside openldap and `id` is the unique value used by shibboleth.

6. Add the attribute to the attribute filter located at `shib-idp/config/shib-idp/attribute-filter.xml`. The `attributeID` value is the same as the `id` value in the previous step. This should also be in the block which has `id="meetmeTest"` in the header.

7. Rebuild the docker images and run the compose files.

8. Sign in using a private tab to make sure that nothing is cached and look at the `session` cookie to make sure the attribute values are being released and that the correct value is retrieved.

### Useful Links

- [A list of shibboleth related containers](https://spaces.at.internet2.edu/display/ITAP/InCommon+Trusted+Access+Platform+Release)
- [eduperson schema](https://wiki.refeds.org/display/STAN/eduPerson)
- [general ldap schema](https://www.rfc-editor.org/rfc/rfc4519)

## LDAP

All of the test userdata should be stored in LDAP. The development shibboleth server uses LDAP as the backend and anything related to validating netid's is done against the same LDAP server.

The setup for the Rutgers LDAP server can be found [here](https://ithelp.rutgers.edu/sp?id=kb_article_view&sysparm_article=KB0017660) but the TLDR of searching for a user is a base of `ou=people,dc=rutgers,dc=edu` and a search filter of `uid=netid`. AKA, every person has `dn: uid=netid1,ou=people,dc=rutgers,dc=edu`.

An example LDAP search can be done using the following
```sh
ldapsearch -x                           \   # simple auth
    -H ldaps://ldap.rutgers.edu         \   # hostname
    -b "ou=people,dc=rutgers,dc=edu"    \   # base search path
    -D '< your service dn here >'       \   # your service dn
    -W                                  \   # prompt for password
    'uid=netid'                             # search filter
```

More detailed information about what some of the actual attributes mean can be found on the following [Rutgers IT page](https://ithelp.rutgers.edu/sp?id=kb_article_view&sysparm_article=KB0017380). The main schema which is used is the `eduPerson` which is described [here](https://wiki.refeds.org/display/STAN/eduPerson). A github repo with the LDIF files can be found [here](https://github.com/REFEDS/eduperson/).



