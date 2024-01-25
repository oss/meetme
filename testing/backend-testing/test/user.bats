setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    load 'test_helper/lib/load'
    source /root/env
}

@test "create user is valid" {
    run mongosh meetme --quiet --eval "JSON.stringify(db.users.findOne({_id: 'netid1'},{__v: 0}))"
    echo "response recieved: ${output}"
    jq_command=(jq -rn --argjson r "${output}")
    assert [ $status -eq 0 ] #makes sure mongosh ran well

    assert_equal $( ${jq_command[@]} '$r | length' ) '9'
    assert_equal $( ${jq_command[@]} '$r._id') 'netid1'

    assert_equal $( ${jq_command[@]} '$r.name | length') '3'
    assert_equal $( ${jq_command[@]} '$r.name.first') 'First1'
    assert_equal $( ${jq_command[@]} '$r.name.midde') 'null'
    assert_equal $( ${jq_command[@]} '$r.name.last') 'Last1'

    assert_equal $( ${jq_command[@]} '$r.calendars' ) '[]'
    assert_equal $( ${jq_command[@]} '$r.organizations' ) '[]'
    assert_equal $( ${jq_command[@]} '$r.pendingCalendars' ) '[]'
    assert_equal $( ${jq_command[@]} '$r.pendingOrganizations' ) '[]'

    assert_equal $( ${jq_command[@]} '$r.alias') 'netid1'
    assert_regex $( ${jq_command[@]} '$r.last_signin' ) '^[0-9]+$'
    assert_regex $( ${jq_command[@]} '$r.account_created' ) '^[0-9]+$'

}

@test "whoami no cookie" {
    mongodump
    run curl -sSk "$API_URL/whoami"
    assert_equal "$output" '{"Status":"error","error":"No user"}'
}

@test "whoami valid cookie" {
    skip
    run curl -c '/cookies/netid1' -b '/cookies/netid1' -sSk "$API_URL/whoami"
    run jq -r -n --argjson RESP "${output}" '$RESP.user.uid'
    #assert_regex "$output" '[0-9a-zA-Z{}:\",]+'
    assert_regex "${output}" 'netid1'
}

@test "whoami invalid cookie" {
    skip
    run curl -sSk "$API_URL/whoami" -H "$COOKIE_NETID1\a"
    assert_equal "$output" '{"Status":"error","error":"No user"}'
}