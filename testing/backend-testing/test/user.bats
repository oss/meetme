setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

@test "whoami no cookie" {
    run curl -sSk "$API_URL/whoami"
    assert_equal "$output" '{"Status":"Error","Error":"No user"}'
}

@test "whoami valid cookie" {
    run curl -sSk "$API_URL/whoami" -H "$COOKIE_NETID1"
    #assert_regex "$output" '[0-9a-zA-Z{}:\",]+'
    assert_regex "$output" '^\{"Status":"ok","user":.+"uid":"netid1".+$'
}

@test "whoami invalid cookie" {
    run curl -sSk "$API_URL/whoami" -H "$COOKIE_NETID1\a"
    assert_equal "$output" '{"Status":"Error","Error":"No user"}'
}