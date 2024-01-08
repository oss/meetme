setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

@test "change calendar name" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" -H "$COOKIE_NETID1" --data-raw '{"new_name":"abcdefg"}'
    assert_equal "$output" '{"Status":"ok","new_name":"abcdefg"}'
}

@test "change calendar name without login" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" --data-raw '{"new_name":"abcdefg"}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "change calendar name made by other user" {
    run curl -sSk -X PATCH "$API_URL/cal/$TARGET_IND_CAL/name" -H "Content-Type: application/json" -H "$COOKIE_NETID3" --data-raw '{"new_name":"hijklmn"}'
    assert_equal "$output" '{"Status":"error","Error":"Calendar does not eixst or you do not have access to this calendar"}'
}
