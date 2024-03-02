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

    NETID5=$(create_ldap_user)
    COOKIE_NETID5=$(getcookie "${NETID5}")

    TARGET_IND_CAL=$(curl -sSk -X POST "$API_URL/cal" -H "$COOKIE_NETID1" -H "Content-Type: application/json" --data-raw '{"timeblocks":[{"start":1660219200000,"end":1660226400000},{"start":1660305600000,"end":1660312800000},{"start":1665057600000,"end":1665064800000}]}'| jq -r '.calendar._id')


    export TARGET_IND_CAL
    export NETID1
    export COOKIE_NETID1
    export NETID2
    export COOKIE_NETID2
    export NETID5
    export COOKIE_NETID5

}

#netid5 already exists, netid6 already exists, invalid is invalid netid
@test "invite as owner" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "$COOKIE_NETID1" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["'"$NETID1"'","'"$NETID5"'","","this is a invalid netid"]}'

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.user_list | length' )" '3'

    assert_equal "$( "${jq_command[@]}" '$r.user_list.already_added[0]' )" "$NETID1"

    assert_equal "$( "${jq_command[@]}" '$r.user_list.added[0]' )" "$NETID5"

    assert_equal "$( "${jq_command[@]}" '$r.user_list.not_added[0]' )" ""
    assert_equal "$( "${jq_command[@]}" '$r.user_list.not_added[1]' )" "this is a invalid netid"


}

@test "decline invite as invitee" {
    #send the invite, to alow for tests to be run in any order 
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "$COOKIE_NETID1" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["'"$NETID5"'"]}'
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -H "$COOKIE_NETID5" -X PATCH

    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.calendar' )" "$TARGET_IND_CAL"
    #assert_equal "$output" "{\"Status\":\"ok\",\"calendar\":\"$TARGET_IND_CAL\"}"
}

@test "accept invite as invitee" {
    #send the invite, incase it has not been sent or has been declined, to alow for tests to be run in any order 
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "$COOKIE_NETID1" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["'"$NETID5"'"]}'
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -H "$COOKIE_NETID5" -X PATCH
    #assert_equal "$output" "{\"Status\":\"ok\",\"calendar\":\"$TARGET_IND_CAL\"}"
    jq_command=( jq -rn --argjson r "${output}" )

    assert_equal "$( "${jq_command[@]}" '$r.Status' )" 'ok'
    assert_equal "$( "${jq_command[@]}" '$r | length' )" '2'

    assert_equal "$( "${jq_command[@]}" '$r.calendar' )" "$TARGET_IND_CAL"
}

@test "fail to accept invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"You have not been invited to this calendar or this calendar does not exist"}'
}

@test "fail to decline invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -H "$COOKIE_NETID2" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"You have not been invited to this calendar or this calendar does not exist"}'
}

@test "fail to accept invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/accept" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "fail to decine invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/decline" -X PATCH
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}

@test "fail to invite as member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -H "$COOKIE_NETID5" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"error","error":"calendar does not exist or you do not have permission to modify this calendar"}'
}

@test "fail to invite as viewer" {
    skip "viewers not enabled"
}

@test "fail to invite as unaffiliated member" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -H "$COOKIE_NETID2" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"error","error":"calendar does not exist or you do not have permission to modify this calendar"}'
}

@test "fail to invite when not logged in" {
    run curl -sSk "$API_URL/cal/$TARGET_IND_CAL/share" -H "Content-Type: application/json" -X PATCH --data-raw '{"new_users":["netid1","netid5","netid6","this is a invalid netid"]}'
    assert_equal "$output" '{"Status":"error","error":"Invalid or Missing Credentials"}'
}