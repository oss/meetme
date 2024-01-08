setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

@test "get memberlist as owner" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID1"
    assert_equal "$output" '{"Status":"ok","memberlist":[{"_id":"netid1","type":"owner"},{"_id":"netid6","type":"user"}]}'
}

@test "get memberlist as member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID6"
    assert_equal "$output" '{"Status":"ok","memberlist":[{"_id":"netid1","type":"owner"},{"_id":"netid6","type":"user"}]}'
}

@test "get memberlist as viewer" {
    skip "viewers not implemented"
}

@test "get memberlist as pending invite" {
    skip "unknown intended behavior"
}

@test "fail to get memberlist as unafiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json' -H "$COOKIE_NETID2"
    assert_equal "$output" '{"Status":"error","Error":"The calendar does not exist or you do not have permission to access this calendar"}'
}

@test "fail to get memberlist when not signed in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/memberlist" -H 'Content-Type: application/json'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}
