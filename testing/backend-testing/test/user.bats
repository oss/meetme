setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    load 'test_helper/lib/load'
    source /root/env
}

@test "create user is valid" {
    run mongosh meetme --quiet --eval "JSON.stringify(db.users.findOne({_id: 'netid1'},{__v: 0}))"
    echo "response recieved: ${output}"
    jq_command=( jq -rn --argjson r "${output}" )
    assert [ $status -eq 0 ] #makes sure mongosh ran well

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '9'
    assert_equal "$( "${jq_command[@]}" '$r._id')" 'netid1'

    assert_equal "$( "${jq_command[@]}" '$r.name | length')" '3'
    assert_equal "$( "${jq_command[@]}" '$r.name.first')" 'First1'
    assert_equal "$( "${jq_command[@]}" '$r.name.midde')" 'null'
    assert_equal "$( "${jq_command[@]}" '$r.name.last')" 'Last1'

    assert_equal "$( "${jq_command[@]}" '$r.calendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organizations' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.pendingCalendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.pendingOrganizations' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.alias')" 'netid1'
    assert_regex "$( "${jq_command[@]}" '$r.last_signin' )" '^[0-9]+$'
    assert_regex "$( "${jq_command[@]}" '$r.account_created' )" '^[0-9]+$'

}

@test "whoami no cookie" {
    hash_before=$(mongo_dump)

    run curl -sSk -w '\n%{json}' "$API_URL/whoami"
    response=$(echo "${output}" | sed -n '1 p')
    details=$(echo "${output}" | sed -n '2 p')

    hash_after=$(mongo_dump)

    assert_equal "$hash_after" "$hash_before"
    assert_equal "$response" '{"Status":"Error","error":"Invalid or Missing Credentials"}'
    assert_equal "$(jq -rn --argjson r "${details}" '$r.http_code')" '401' 
}

@test "whoami valid cookie" {
    run curl -sSk -w '\n%{json}' -c '/cookies/netid1' -b '/cookies/netid1' "$API_URL/whoami"
    response=$(echo "${output}" | sed -n '1 p')
    details=$(echo "${output}" | sed -n '2 p')

    jq_command=( jq -rn --argjson r "${response}" )
    
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '3'

    assert_equal "$( "${jq_command[@]}" '$r.user | length' )" '3'
    assert_equal "$( "${jq_command[@]}" '$r.user.uid' )" 'netid1'
    assert_equal "$( "${jq_command[@]}" '$r.user.firstName' )" 'First1'
    assert_equal "$( "${jq_command[@]}" '$r.user.lastName' )" 'Last1'

    assert_equal "$( "${jq_command[@]}" '$r.session | length' )" '2'
    assert_regex "$( "${jq_command[@]}" '$r.session.time' )" '[0-9]+'
    assert_equal "$( "${jq_command[@]}" '$r.session.passport.user.uid' )" 'netid1'
    assert_equal "$( "${jq_command[@]}" '$r.session.passport.user.firstName' )" 'First1'
    assert_equal "$( "${jq_command[@]}" '$r.session.passport.user.lastName' )" 'Last1'

    assert_equal "$(jq -rn --argjson r "${details}" '$r.http_code')" '200' 
}

@test "whoami invalid cookie" {
    skip
    run curl -sSk "$API_URL/whoami" -H "$COOKIE_NETID1\a"
    assert_equal "$output" '{"Status":"error","error":"No user"}'
}