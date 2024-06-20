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

    TARGET_ORG=$(curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{}' | jq -r '.organization._id')

    export TARGET_ORG
    export NETID1
    export COOKIE_NETID1
    export NETID2
    export COOKIE_NETID2

}

#org calendar tests
@test "create org calendar as org owner" {
    run curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"organization","id":"'"$TARGET_ORG"'"}}'
    
    #assert_regex "$output" '\{"Status":"ok","calendar":\{"owner":\{"owner_type":"organization","_id":"[a-f0-9]{64}"\},"meetingTime":\{"start":null,"end":null\},"deleted":\{"isDeleted":false\},"_id":"([a-f0-9]){64}","blocks":\[\{"start":1660219200000,"end":1660226400000\},\{"start":1660305600000,"end":1660312800000\},\{"start":1665057600000,"end":1665064800000\}\],"users":\[\],"pendingUsers":\[\],"viewers":\[\],"links":\[\]\}\}'
    
    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.calendar | length' )" '8'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner | length' )" '2'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.owner.owner_type' )" 'organization'
    assert_regex "$( "${jq_command[@]}" '$r.calendar.owner._id' )" '^[a-zA-Z0-9_\-]*'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.deleted.isDeleted' )" 'false'

    assert_regex "$( "${jq_command[@]}" '$r.calendar._id' )" '^[a-zA-Z0-9_\-]*'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].start' )" '1660219200000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[0].end' )" '1660226400000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].start' )" '1660305600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[1].end' )" '1660312800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].start' )" '1665057600000'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.blocks[2].end' )" '1665064800000'

    assert_equal "$( "${jq_command[@]}" '$r.calendar.users' )" "[]"
    assert_equal "$( "${jq_command[@]}" '$r.calendar.pendingUsers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.viewers' )" '[]'
    assert_equal "$( "${jq_command[@]}" '$r.calendar.links' )" '[]'
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
    assert_equal "$output" '{"Status":"error","error":"Org not found or not able to add calendar to org"}'
}

@test "fail to create org calendar when not logged in" {
    run curl -sSk -X POST "$API_URL/cal" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}], "owner":{"type":"organization","id":"'"$TARGET_ORG"'"}}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}