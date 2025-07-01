#horrible intendation but most readible form

function create_ldap_user {
    #create a unique number for netid
    base_id="$(echo $EPOCHREALTIME | sed -r 's/\.//g')"
    netid="$( echo "${base_id}" | tr 0123456789 abcdefghij)"

    ldif_string=$(cat << EOF

dn: uid=${netid},ou=users,dc=example,dc=org
cn: User${netid}
sn: Last${netid}
givenName: First${netid}
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
userPassword: rutgers${netid}
uid: ${netid}
uidNumber: ${base_id}
gidNumber: ${base_id}
homeDirectory: /home/${netid}

EOF
)
    ldapadd -H ldap://ldap.localhost.edu:1389 -x -D 'cn=admin,dc=example,dc=org' -w 'adminpassword' -f <(echo "${ldif_string}") > /dev/null || fail
    echo "$netid"
}

function remove_ldap_user {
    ldapdelete -H ldap://ldap.localhost.edu:1389 -D 'cn=admin,dc=example,dc=org' -w 'adminpassword' "cn=${1},ou=users,dc=example,dc=org" > /dev/null || fail
}