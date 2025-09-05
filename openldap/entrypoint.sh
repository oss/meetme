#!/usr/bin/env sh

# TODO: evaluate if we need to do openldap stuff using openldap user
#       this would requires changes to the dockerfile

# Start the ldap server for detup, use ldapi:/// to listen on socket
echo "Starting LDAP setup..."
slapd -h "ldapi:///" 
echo "LDAP server started!"
echo ""

# Load the eduPerson custom schema 
echo "Adding eduPerson schema..."
ldapadd -Q -Y EXTERNAL -H "ldapi:///" -f ./eduPerson.ldif

# Use -c to ignore errors and keep addings stuff
# Pass password in since it prompts for one
echo "Adding initial groups and users..."
ldapadd -x -D "cn=admin,dc=example,dc=org" -H "ldapi:///" -w "adminpassword" -c -f ./bootstrap.ldif

# TODO: see if we need this
# Remove the builtin administrator
# echo "Removing per-database administrator"
# ldapdelete -x -D "cn=admin,dc=example,dc=org" -w "adminwpassword" -H "ldapi:///" cn=admin,dc=example,dc=org

# Add the administrator account as a user, openldap makes a built-in
# non-admin user account by default, which we will remove later. The
# admin user account is needed in order for shib to connect.
echo "Adding administrator..."
ldapadd -x -D "cn=admin,dc=example,dc=org" -H "ldapi:///" -w "adminpassword" <<EOF
dn: cn=admin,dc=example,dc=org
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: admin
description: LDAP administrator
userPassword: adminpassword
EOF

# Print some basic configuration information about the ldap server
echo "Printing information..."
ldapsearch -x -LLL -s base -b "" -H "ldapi:///" namingContexts
ldapsearch -LLLQ -Y EXTERNAL -H "ldapi:///" -b cn=config dn

# We are done with the setup, now kill slapd and run it again
echo "LDAP setup finished, killing server..."
kill -INT $(cat /var/run/slapd/slapd.pid)
echo "LDAP server killed!"

# Run again with higher debug level, specifying -d makes it take over
# the current shell, as if it was an exec
echo "LDAP setup completed, starting LDAP server now on port 1389..."
echo "---------------------------------------------------"
slapd -h "ldap://:1389/" -d 512
