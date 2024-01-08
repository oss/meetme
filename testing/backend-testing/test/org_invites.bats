setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

@test "invite members as owner" {
    run curl -sSk $API_URL/org/$TARGET_ORG/share -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH --data-raw '{"new_users":["netid3","netid6","invalid netid","netid1"]}'
    assert_equal "$output" '{"Status":"ok","user_list":{"added":["netid3","netid6"],"not_added":["invalid netid"],"already_added":["netid1"]}}'
}

@test "fail to accept invite when not logged in" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -X PATCH
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "fail to accept invite when org does not exist" {
    run curl -sSk $API_URL/org/${TARGET_ORG}sda/accept -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"Organization does not exist or you do not have access"}'
}

@test "accept invite when invitee" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/accept -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"ok","org":"'$TARGET_ORG'"}'
}

@test "fail to accept invite as owner" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/accept -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"Organization does not exist or you do not have access"}'
}

@test "fail to accept invite as admin" {
    skip 'admins not implemented'
}

@test "fail to accept invite as editor" {
    skip 'editors not implemented'
}

@test "fail to accept invite as member" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/accept -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"Organization does not exist or you do not have access"}'
}

@test "fail to accept invite as viewer" {
    skip 'viewers not implemented'
}

@test "fail to accept invite as random user" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/accept -H "Content-Type: application/json" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"Organization does not exist or you do not have access"}'
}

@test "fail to decline invite when not logged in" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/decline -H "Content-Type: application/json" -X PATCH
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "fail to decline invite when org does not exist" {
    run curl -sSk $API_URL/org/${TARGET_ORG}sdhacjbasc/decline -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"you do not have access to this org or this org does not exist"}'
}

@test "decline invite when invitee" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/decline -H "Content-Type: application/json" -H "$COOKIE_NETID6" -X PATCH
    assert_equal "$output" '{"Status":"ok","org":"'$TARGET_ORG'"}'
}

@test "fail to decline invite as owner" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/decline -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"you do not have access to this org or this org does not exist"}'
}

@test "fail to decline invite as admin" {
    skip "admins not implemented"
}

@test "fail to decline invite as editor" {
    skip "editors not implemented"
}

@test "fail to decline invite as member" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/decline -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"you do not have access to this org or this org does not exist"}'
}

@test "fail to decline invite as viewer" {
    skip "viewers not implemented"
}

@test "fail to decline invite as random user" {
    run curl -sSk $API_URL/org/${TARGET_ORG}/decline -H "Content-Type: application/json" -H "$COOKIE_NETID4" -X PATCH
    assert_equal "$output" '{"Status":"error","Error":"you do not have access to this org or this org does not exist"}'
}