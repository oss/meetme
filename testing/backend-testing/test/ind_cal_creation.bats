setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    load 'test_helper/lib/load'
    source /root/env
}

setup_file() {
    load 'test_helper/lib/load'
    NETID=$(create_ldap_user)
    COOKIE_NETID=$(getcookie "${NETID}")

    export NETID
    export COOKIE_NETID
}

#individual calendar tests
@test "create calendar default" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'
    #assert_regex "$output" '^\{"Status":"ok","calendar":\{"owner":\{"owner_type":"individual","_id":"netid1"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},
    #"_id":"[a-f0-9]{64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],
    #"users":\[\{"_id":"netid1","times":\[\]\}\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}$'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.calendar | length' )" '9'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner.owner_type' )" 'individual'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner._id' )" "${NETID}"

    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime.start' )" 'null'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime.end' )" "null"

    assert_equal "$( "${jq_command[@]}" '$r.calendar.deleted.isDeleted' )" 'false'

    assert_regex "$( "${jq_command[@]}" '$r.calendar._id' )" '^[a-zA-Z0-9_\-]*'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].start' )" '1660219200000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].end' )" '1660226400000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].start' )" '1660305600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].end' )" '1660312800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].start' )" '1665057600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].end' )" '1665064800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.users[0]._id' )" "${NETID}"
    assert_equal "$( "${jq_command[@]}" '$r.calendar.users[0].times' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.pendingUsers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.viewers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.links' )" '[]'


}


@test "create individual calendar for me" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"'"$NETID"'"}}'
    #assert_regex "$output" '^\{"Status":"ok","calendar":\{"owner":\{"owner_type":"individual","_id":"netid1"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},"_id":"[a-f0-9]{64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],"users":\[\{"_id":"netid1","times":\[\]\}\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}$'
    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.calendar | length' )" '9'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner.owner_type' )" 'individual'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner._id' )" "${NETID}"

    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime.start' )" 'null'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.meetingTime.end' )" "null"

    assert_equal "$( "${jq_command[@]}" '$r.calendar.deleted.isDeleted' )" 'false'

    assert_regex "$( "${jq_command[@]}" '$r.calendar._id' )" '^[a-zA-Z0-9_\-]*'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].start' )" '1660219200000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].end' )" '1660226400000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].start' )" '1660305600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].end' )" '1660312800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].start' )" '1665057600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].end' )" '1665064800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.users[0]._id' )" "${NETID}"
    assert_equal "$( "${jq_command[@]}" '$r.calendar.users[0].times' )" '[]'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.pendingUsers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.viewers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.links' )" '[]'
}

@test "fail to create individual calendar as someone else" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"'"$(create_ldap_user)"'"}}'
    assert_equal "$output" '{"Status":"error","error":"Owner does not match session"}'
}

@test "fail to create individual calendar when not logged in (default)" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "fail to create individual calendar when not logged in (w/ owner json)" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"individual","id":"'"$NETID"'"}}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}