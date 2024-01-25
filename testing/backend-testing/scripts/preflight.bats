setup() {
    load '../test/test_helper/bats-support/load'
    load '../test/test_helper/bats-assert/load'
}

@test "able to establish connection to backend server" {
    curl -sSk "$API_URL"
}

@test "able to access metadata" {
    run curl -sSk "$API_URL/test/dump_metadata"
    if [ $status -eq 0 ]; then
        assert_regex "$output" '\{"dump":\['
    else
        assert_failure "$output"
    fi
}

@test "able to access maindata" {
    run curl -sSk $API_URL/test/dump_maindata
    if [ $status -eq 0 ]; then
        assert_regex "$output" '\{"dump":\['
    else
        assert_failure "$output"
    fi
}

@test "able to access org data" {
    run curl -sSk $API_URL/test/dump_orgs
    if [ $status -eq 0 ]; then
        assert_regex "$output" '\{"dump":\['
    else
        assert_failure "$output"
    fi
}

@test "able to access user data" {
    run curl -sSk $API_URL/test/dump_users
    if [ $status -eq 0 ]; then
        assert_regex "$output" '\{"dump":\['
    else
        assert_failure "$output"
    fi
}
