setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}
#org calendar tests
@test "create org calendar as org owner" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"organization","id":"'"$TARGET_ORG"'"}}'
    assert_regex "$output" '\{"Status":"ok","calendar":\{"owner":\{"owner_type":"organization","_id":"[a-f0-9]{64}"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},"_id":"([a-f0-9]){64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],"users":\[\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}'
}

@test "create org calendar as org admin" {
    skip "admins not implemented"
}

@test "create org calendar as org editor" {
    skip "editor not implemented"
}

@test "fail to create org calendar as org member" {
    skip "implement invites first"
}

@test "fail to create org calendar as org viewer" {
    skip "viewers not implemented"
}

@test "fail to create org calendar as pending member" {
    skip
}

@test "fail to create org calendar as unafilliated member" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID2" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"organization","id":"'"$TARGET_ORG"'"}}'
    assert_equal "$output" '{"Status":"Error","Error":"Org not found or not able to add calendar to org"}'
}

@test "fail to create org calendar when not logged in" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"organization","id":"'"$TARGET_ORG"'"}}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}