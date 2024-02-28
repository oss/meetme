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

    TARGET_IND_CAL=$(curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'| jq -r '.calendar._id')

    export TARGET_IND_CAL
    export NETID1
    export COOKIE_NETID1
    export NETID2
    export COOKIE_NETID2

}

@test "change calendar name" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" -H "$COOKIE_NETID1" --data-raw '{"new_name":"abcdefg"}'
    assert_equal "$output" '{"Status":"ok","new_name":"abcdefg"}'
}

@test "change calendar name without login" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" --data-raw '{"new_name":"abcdefg"}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "change calendar name made by other user" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" -H "$COOKIE_NETID2" --data-raw '{"new_name":"hijklmn"}'
    assert_equal "$output" '{"Status":"error","error":"Calendar does not eixst or you do not have access to this calendar"}'
}
