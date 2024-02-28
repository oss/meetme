setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

setup_file() {
    load 'test_helper/lib/load'

    NETID1=$(create_ldap_user)
    COOKIE_NETID1=$(getcookie "${NETID1}")

    NETID2=$(create_ldap_user)
    COOKIE_NETID2=$(getcookie "${NETID2}")

    NETID5=$(create_ldap_user)
    COOKIE_NETID5=$(getcookie "${NETID5}")

    #create the cal
    TARGET_IND_CAL=$(curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'| jq -r '.calendar._id')
    #send invite 
    curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "$COOKIE_NETID1" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["'"$NETID5"'"]}'
    #accept invite
    curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -H "$COOKIE_NETID5" -X PATCH

    export TARGET_IND_CAL
    export NETID1
    export COOKIE_NETID1
    export NETID2
    export COOKIE_NETID2
    export NETID5
    export COOKIE_NETID5

}

@test "get memberlist as owner" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID1"
    #assert_equal "$output" '{"Status":"ok","memberlist":[{"_id":"'"$NETID1"'","type":"owner"},{"_id":"'"$NETID5"'","type":"user"}]}'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.memberlist[0]._id' )" "$NETID1"
    assert_equal "$( "${jq_command[@]}" '$r.memberlist[0].type' )" "owner"

    assert_equal "$( "${jq_command[@]}" '$r.memberlist[1]._id' )" "$NETID5"
    assert_equal "$( "${jq_command[@]}" '$r.memberlist[1].type' )" "user"
}

@test "get memberlist as member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID5"
    #assert_equal "$output" '{"Status":"ok","memberlist":[{"_id":"'"$NETID1"'","type":"owner"},{"_id":"'"$NETID5"'","type":"user"}]}'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.memberlist[0]._id' )" "$NETID1"
    assert_equal "$( "${jq_command[@]}" '$r.memberlist[0].type' )" "owner"

    assert_equal "$( "${jq_command[@]}" '$r.memberlist[1]._id' )" "$NETID5"
    assert_equal "$( "${jq_command[@]}" '$r.memberlist[1].type' )" "user"
}

@test "get memberlist as viewer" {
    skip "viewers not implemented"
}

@test "get memberlist as pending invite" {
    skip "unknown intended behavior"
}

@test "fail to get memberlist as unafiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID2"
    assert_equal "$output" '{"Status":"error","error":"The calendar does not exist or you do not have permission to access this calendar"}'
}

@test "fail to get memberlist when not signed in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}
