setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

#netid5 already exists, netid6 doesnt exist but is valid, invalid is invalid netid
@test "invite as owner" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "$COOKIE_NETID1" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"ok","user_list":{"already_added":["netid1"],"added":["netid5","netid6"],"not_added":["this is a invalid netid"]}}'
}

@test "accept invite as invitee" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -H "$COOKIE_NETID6" -X PATCH
    assert_equal "$output" "{\"Status\":\"ok\",\"calendar\":\"$TARGET_IND_CAL\"}"
}

@test "decline invite as invitee" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -H "$COOKIE_NETID5" -X PATCH
    assert_equal "$output" "{\"Status\":\"ok\",\"calendar\":\"$TARGET_IND_CAL\"}"
}

@test "fail to accept invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"You have not been invited to this calendar or this calendar does not exist"}'
}

@test "fail to decline invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"You have not been invited to this calendar or this calendar does not exist"}'
}

@test "fail to accept invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -X PATCH
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "fail to decine invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -X PATCH
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

#netid6 is a member from previous tests
@test "fail to invite as member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -H "$COOKIE_NETID6" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"error","Error":"calendar does not exist or you do not have permission to modify this calendar"}'
}

@test "fail to invite as viewer" {
    skip "viewers not enabled"
}

@test "fail to invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -H "$COOKIE_NETID2" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"error","Error":"calendar does not exist or you do not have permission to modify this calendar"}'
}

@test "fail to invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}