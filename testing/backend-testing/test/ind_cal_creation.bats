setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

#individual calendar tests
@test "create calendar default" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'
    if [ "$status" -eq 0 ]; then
        save_cal $output && assert_regex "$output" '^\{"Status":"ok","calendar":\{"owner":\{"owner_type":"individual","_id":"netid1"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},"_id":"[a-f0-9]{64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],"users":\[\{"_id":"netid1","times":\[\]\}\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}$'
    else
        run echo "$output"
        assert_failure
    fi
}

function save_cal {
    echo TARGET_IND_CAL=\'$(echo $@ | jq -r '.calendar._id')\' >> /root/env
}

@test "create individual calendar for me" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"netid1"}}'
    assert_regex "$output" '^\{"Status":"ok","calendar":\{"owner":\{"owner_type":"individual","_id":"netid1"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},"_id":"[a-f0-9]{64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],"users":\[\{"_id":"netid1","times":\[\]\}\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}$'
}

@test "fail to create individual calendar as someone else" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"netid2"}}'
    assert_equal "$output" '{"Status":"Error","Error":"Owner does not match session"}'
}

@test "fail to create individual calendar when not logged in (default)" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "fail to create individual calendar when not logged in (w/ owner json)" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"netid1"}}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}