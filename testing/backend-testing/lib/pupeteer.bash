function getcookie {
    node "scripts/getcookie.js" "${1}" "rutgers${1}" || fail
}