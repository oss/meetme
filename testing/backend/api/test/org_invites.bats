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

    NETID3=$(create_ldap_user)
    COOKIE_NETID3=$(getcookie "${NETID3}")

    NETID6=$(create_ldap_user)
    COOKIE_NETID6=$(getcookie "${NETID6}")

    #create the org
    TARGET_ORG=$(curl -sSk "$API_URL/org" -X POST -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{}' | jq -r '.organization._id')

    export TARGET_ORG
    export NETID1
    export COOKIE_NETID1
    export NETID2
    export COOKIE_NETID2
    export NETID3
    export COOKIE_NETID3
    export NETID6
    export COOKIE_NETID6

}

@test "invite members as owner" {
    run curl -sSk $API_URL/org/$TARGET_ORG/share -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH --data-raw '{"new_users":["'"$NETID3"'","'"$NETID6"'","invalid netid","","'"$NETID1"'"]}'
    #assert_equal "$output" '{"Status":"ok","user_list":{"added":["'"$NETID3"'","'"$NETID6"'"],"not_added":["invalid netid",""],"already_added":["'"$NETID1"'"]}}'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'

    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.user_list | length' )" '3'

    assert_equal "$( "${jq_command[@]}" '$r.user_list.added[0]' )" "$NETID3"
    assert_equal "$( "${jq_command[@]}" '$r.user_list.added[1]' )" "$NETID6"

    assert_equal "$( "${jq_command[@]}" '$r.user_list.not_added[0]' )" "invalid netid"
    assert_equal "$( "${jq_command[@]}" '$r.user_list.not_added[1]' )" ""

    assert_equal "$( "${jq_command[@]}" '$r.user_list.already_added[0]' )" "$NETID1"
}

@test "fail to accept invite when not logged in" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "fail to accept invite when org does not exist" {
    run curl -sSk $API_URL/org/${TARGET_ORG}sda/accept -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Organization does not exist or you do not have access"}'
}

@test "accept invite when invitee" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"ok","org":"'$TARGET_ORG'"}'
}

@test "fail to accept invite as owner" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Organization does not exist or you do not have access"}'
}

@test "fail to accept invite as admin" {
    skip 'admins not implemented'
}

@test "fail to accept invite as editor" {
    skip 'editors not implemented'
}

@test "fail to accept invite as member" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Organization does not exist or you do not have access"}'
}

@test "fail to accept invite as viewer" {
    skip 'viewers not implemented'
}

@test "fail to accept invite as random user" {
    run curl -sSk $API_URL/org/$TARGET_ORG/accept -H "Content-Type: application/json" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Organization does not exist or you do not have access"}'
}

@test "fail to decline invite when not logged in" {
    run curl -sSk $API_URL/org/$TARGET_ORG/decline -H "Content-Type: application/json" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "fail to decline invite when org does not exist" {
    run curl -sSk $API_URL/org/${TARGET_ORG}sdhacjbasc/decline -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"you do not have access to this org or this org does not exist"}'
}

@test "decline invite when invitee" {
    run curl -sSk $API_URL/org/$TARGET_ORG/decline -H "Content-Type: application/json" -H "$COOKIE_NETID6" -X PATCH
    assert_equal "$output" '{"Status":"ok","org":"'$TARGET_ORG'"}'
}

@test "fail to decline invite as owner" {
    run curl -sSk $API_URL/org/$TARGET_ORG/decline -H "Content-Type: application/json" -H "$COOKIE_NETID1" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"you do not have access to this org or this org does not exist"}'
}

@test "fail to decline invite as admin" {
    skip "admins not implemented"
}

@test "fail to decline invite as editor" {
    skip "editors not implemented"
}

@test "fail to decline invite as member" {
    run curl -sSk $API_URL/org/$TARGET_ORG/decline -H "Content-Type: application/json" -H "$COOKIE_NETID3" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"you do not have access to this org or this org does not exist"}'
}

@test "fail to decline invite as viewer" {
    skip "viewers not implemented"
}

@test "fail to decline invite as random user" {
    run curl -sSk $API_URL/org/$TARGET_ORG/decline -H "Content-Type: application/json" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"you do not have access to this org or this org does not exist"}'
}