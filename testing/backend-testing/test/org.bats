setup() {
    load 'test_helper/bats-support/load'
    load 'test_helper/bats-assert/load'
    source /root/env
}

@test "create org no name" {
    run curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{}'
    if [ "$status" -eq 0 ]; then
        save_org $output && assert_regex "$output" '^\{"Status":"ok","organization":\{"_id":"[a-z0-9]+","calendars":\[\],"admins":\[\],"editors":\[\],"members":\[\],"viewers":\[\],"pendingMembers":\[\],"name":"unnamed organization","owner":"netid1","\_\_v":0\}\}$'
    else
        run echo "$output"
        assert_failure 
    fi
}

function save_org {
    echo TARGET_ORG=\'$(echo $@ | jq -r '.organization._id')\' >> /root/env
}

@test "fail to create org no name when not logged in" {
    run curl -sSk "$API_URL/org" -X POST -H "Content-Type: application/json" --data-raw '{}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}

@test "create org with name" {
    run curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"name":"this is a hardcoded name"}'
    assert_regex "$output" '^\{"Status":"ok","organization":\{"\_id":"[a-z0-9]+","calendars":\[\],"admins":\[\],"editors":\[\],"members":\[\],"viewers":\[\],"pendingMembers":\[\],"name":"this is a hardcoded name","owner":"netid1","__v":0\}\}$'
}

@test "fail to create org with name when not logged in" {
    run curl -sSk "$API_URL/org" -X POST -H "Content-Type: application/json" --data-raw '{}'
    assert_equal "$output" '{"Status":"Error","Error":"not logged in"}'
}