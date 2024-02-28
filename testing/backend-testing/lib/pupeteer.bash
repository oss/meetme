function getcookie {
    node "scripts/getsession.js" "${1}" "rutgers${1}" || fail
}