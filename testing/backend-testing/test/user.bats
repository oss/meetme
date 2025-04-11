setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    load 'test_helper/lib/load'
}


setup_file() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    load 'test_helper/lib/load'

    echo "loaded setup file" >> /tmp/logs

    NETID=$(create_ldap_user)
    echo "create ldap" >> /tmp/logs

    COOKIE_NETID=$(getcookie "${NETID}")
    echo "got cookie" >> /tmp/logs

    export NETID
    export COOKIE_NETID
}


@test "create user is valid" {
    run get_user ${NETID}
    echo "response recieved: ${output}"
    jq_command=( jq -rn --argjson r "${output}" )
    assert [ $status -eq 0 ] #makes sure mongosh ran well

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '9'
    assert_equal "$( "${jq_command[@]}" '$r._id')" "${NETID}"

    assert_equal "$( "${jq_command[@]}" '$r.name | length')" '3'
    assert_equal "$( "${jq_command[@]}" '$r.name.first')" 'First'"${NETID}"
    assert_equal "$( "${jq_command[@]}" '$r.name.midde')" 'null'
    assert_equal "$( "${jq_command[@]}" '$r.name.last')" 'Last'"${NETID}"

    assert_equal "$( "${jq_command[@]}" '$r.calendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organizations' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.pendingCalendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.pendingOrganizations' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.alias')" "${NETID}"
    assert_regex "$( "${jq_command[@]}" '$r.last_signin' )" '^[0-9]+$'
    assert_regex "$( "${jq_command[@]}" '$r.account_created' )" '^[0-9]+$'

    echo "${output}" > /templates/user.json
}

@test "whoami no cookie" {
    hash_before=$(mongo_dump)

    run curl -sSk -w '\n%{json}' "$API_URL/whoami"
    response=$(echo "${output}" | sed -n '1 p')
    details=$(echo "${output}" | sed -n '2 p')

    hash_after=$(mongo_dump)

    assert_equal "$hash_after" "$hash_before"
    assert_equal "$response" '{"Status":"error","error":"Invalid or Missing Credentials"}'
    assert_equal "$(jq -rn --argjson r "${details}" '$r.http_code')" '401'
}

@test "whoami valid cookie" {
    hash_before=$(mongo_dump)

    run curl -sSk -w '\n%{json}' -H "$COOKIE_NETID" "$API_URL/whoami"
    response=$(echo "${output}" | sed -n '1 p')
    details=$(echo "${output}" | sed -n '2 p')

    hash_after=$(mongo_dump)
    assert_equal "$hash_after" "$hash_before"
    
    jq_command=( jq -rn --argjson r "${response}" )

    
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '3'

    assert_equal "$( "${jq_command[@]}" '$r.user | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.user.uid' )" "${NETID}"
    assert_equal "$( "${jq_command[@]}" '$r.user.firstName' )" 'First'"${NETID}"

    assert_equal "$( "${jq_command[@]}" '$r.session | length' )" '2'
    assert_regex "$( "${jq_command[@]}" '$r.session.time' )" '[0-9]+'
    assert_equal "$( "${jq_command[@]}" '$r.session.passport.user.uid' )" "${NETID}"
    assert_equal "$( "${jq_command[@]}" '$r.session.passport.user.firstName' )" 'First'"${NETID}"

    assert_equal "$(jq -rn --argjson r "${details}" '$r.http_code')" '200' 
}

@test "whoami invalid cookie (invalid session.sig) " {
    session_sig=$(echo "$COOKIE_NETID" | grep -E 'session.sig=' | sed -r 's/.$/zz/' ) #
    session=$(echo "$COOKIE_NETID" | grep -E 'session=' )

    hash_before=$(mongo_dump)
    # example cookie header
    #'Cookie: session=eyJwYXNzcG9ydCI6eyJ1c2VyIjp7InVpZCI6Im5ldGlkMSIsImZpcnN0TmFtZSI6IkZpcnN0MSIsImxhc3ROYW1lIjoiTGFzdDEifX0sInRpbWUiOjE3MDYzMjQ5M30=; session.sig=dPIYPDkQl8Zve7hjIR-cDscaoRM'
    run curl -sSk -w '\n%{json}' -H "Cookie: ${session}; ${session_sig}" "$API_URL/whoami"
    response=$(echo "${output}" | sed -n '1 p')
    details=$(echo "${output}" | sed -n '2 p')

    hash_after=$(mongo_dump)
    assert_equal "$hash_after" "$hash_before"

    assert_equal "${response}" '{"Status":"error","error":"Invalid or Missing Credentials"}'

    assert_equal "$(jq -rn --argjson r "${details}" '$r.http_code')" '401'
}

@test "whoami invalid cookie (invalid session) " {
    skip
}

@test "whoami expired cookie" {
    skip
}