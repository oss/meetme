setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

setup_file() {
    load 'test_helper/lib/load'

    NETID1=$(create_ldap_user)
    COOKIE_NETID1=$(getcookie "${NETID1}")

    export NETID1
    export COOKIE_NETID1

}

@test "create org no name" {
    run curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{}'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.organization | length' )" '10'

    assert_regex "$( "${jq_command[@]}" '$r.organization._id' )" '[a-z0-9]+'


    assert_equal "$( "${jq_command[@]}" '$r.organization.calendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.admins' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.editors' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.pendingMembers' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.organization.name' )" "unnamed organization"
    assert_equal "$( "${jq_command[@]}" '$r.organization.owner' )" "$NETID1"

    #assert_regex "$output" '^\{"Status":"ok","organization":\{"_id":"[a-z0-9]+","calendars":\[\],"admins":\[\],"editors":\[\],"members":\[\],"viewers":\[\],"pendingMembers":\[\],"name":"unnamed organization","owner":"'"$NETID1"'","\_\_v":0\}\}$'
}

@test "fail to create org no name when not logged in" {
    run curl -sSk "$API_URL/org" -X POST -H "Content-Type: application/json" --data-raw '{}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "create org with name" {
    run curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"name":"this is a hardcoded name"}'
    
    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.organization | length' )" '10'

    assert_regex "$( "${jq_command[@]}" '$r.organization._id' )" '[a-z0-9]+'


    assert_equal "$( "${jq_command[@]}" '$r.organization.calendars' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.admins' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.editors' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.organization.pendingMembers' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.organization.name' )" "this is a hardcoded name"
    assert_equal "$( "${jq_command[@]}" '$r.organization.owner' )" "$NETID1"
    
    #assert_regex "$output" '^\{"Status":"ok","organization":\{"\_id":"[a-z0-9]+","calendars":\[\],"admins":\[\],"editors":\[\],"members":\[\],"viewers":\[\],"pendingMembers":\[\],"name":"this is a hardcoded name","owner":"'"$NETID1"'","__v":0\}\}$'
}

@test "fail to create org with name when not logged in" {
    run curl -sSk "$API_URL/org" -X POST -H "Content-Type: application/json" --data-raw '{}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}