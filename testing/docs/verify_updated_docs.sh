PROJECT_DIR="/project"
backend_has_no_changes(){
    if [[ $(git -C "$PROJECT_DIR" status --porcelain backend) ]]; then
        return 1
    fi
}

diagram_uptodate(){
    FRONTEND_ARCHITECTURE_FILE="${PROJECT_DIR}/docs/docs/architecture/systems.md"
    start_header=$(grep -En '^## Frontend Architecture$' "$FRONTEND_ARCHITECTURE_FILE" | grep -Eo '^[0-9]+')
    start_codeblock=$(tail +"$start_header" "$FRONTEND_ARCHITECTURE_FILE" | grep -n '```' | grep -Eo '^[0-9]+' )
    line_range=($(tail +"$start_header" "$FRONTEND_ARCHITECTURE_FILE" | grep -n -m2 '```' | grep -Eo '^[0-9]+'))
    codeblock_start=$((${line_range[0]} + $start_header + 1)) # +1 line because of mermaid specification
    codeblock_end=$((${line_range[1]} + $start_header - 2)) #-1 because end at line before and -1 for starting at line 1
    #echo $start_header
    #echo $codeblock_start
    #echo $codeblock_end
    sha1_chart_docs=$(sed -n ${codeblock_start},${codeblock_end}p "$FRONTEND_ARCHITECTURE_FILE" | sort | sha1sum | grep -Eo '^[0-9a-f]+' )
    sha1_chart_node=$(node gen_diagram.js | sort | sha1sum | grep -Eo '^[0-9a-f]+' )
    if ! [[ "$sha1_chart_docs" == "$sha1_chart_node" ]]; then
        echo "chart in docs does not match actual depdenency graph"
        echo $sha1_chart_docs
        echo $sha1_chart_node
        node gen_diagram.js | sort
        return 1
    fi

}

verify_frontend(){
    diagram_uptodate
}

get_latest_git_hash_in_range(){
    start_of_endpoint_code_line="$1"
    end_of_endpoint_code_line="$2"
    target_file="$3"

    GIT_HASHES=$(git -C "$PROJECT_DIR" --no-pager blame --date=raw -l -L "$start_of_endpoint_code_line,$end_of_endpoint_code_line" "$target_file" | grep -Eo "^[a-f0-9]+" | uniq )
    local soonest_hash=""
    local soonest_hash_time=0
    for hash in $GIT_HASHES; do
        TIME=$(git -C "$PROJECT_DIR" --no-pager show --no-patch --no-notes --pretty='%at' "$hash")
        if [[ $TIME -gt $soonest_hash_time ]];then
            soonest_hash="$hash"
            soonest_hash_time="$TIME"
        fi
    done
    echo -n "$soonest_hash"
}

# code is a subset of endpoints in docs
summary_hash_latest(){
    local FILE_TO_TEST="$1"
    local START_OF_ENDPOINTS=$(grep -En 'router.(get|post|patch|delete)' "$FILE_TO_TEST" | awk '{print $1}' FS=":")

    for start in $START_OF_ENDPOINTS; do
        local end=$(sed -n "$start,\$p" "$FILE_TO_TEST" | grep -n -m 1 -E '^\}?\);$' | awk '{print $1}' FS=":" )
        end=$(($start + $end - 1))
        local soonest_hash=$(get_latest_git_hash_in_range "$start" "$end" "$FILE_TO_TEST")

        local method=$(sed -r "$start!d" "$FILE_TO_TEST" | sed -r 's/router.(get|post|patch|delete).*/\1/' | xargs | awk '{ print toupper($0) }' )
        local route=$(sed -r "$start!d" "$FILE_TO_TEST" | sed -r "s/router.(get|post|patch|delete)\('(.*)'.*/\\2/g" | xargs )
        route=$(sed -r 's/\/$//g' <<< "$route" )
        

        if ! [[ $method =~ GET|POST|PATCH|DELETE ]] || [[ $route =~ .*route.* ]]; then
            echo "error extracting route and/or method from source code"
            echo "method: $method"
            echo "route: $route"
            echo "method or route is not found in range $start and $end of file $FILE_TO_TEST"
            #return 1
            continue;
        fi

        local backend_folder=$( sed -r 's/^\/project\/backend\/(.*)\/.*.js$/\1/g' <<< "$FILE_TO_TEST" )
        local route_prefix=$(jq -r ".[] | select(.dir == \"$backend_folder\") | .route " "${PROJECT_DIR}/backend/router_config.json")

        if [ -z $route_prefix ]; then
            route_prefix='/'
        fi

        local endpoint=$(sed -r 's\^//\/\'<<< "${route_prefix}${route}") #edge case for any router loader which start with /
        local summary_hash=$(grep -Eo "^\| $endpoint \| $method \|.*hash=[a-f0-9]+$" "${PROJECT_DIR}/docs/docs/api/api-summary.md" | sed -r 's/.*hash=//' )
        echo "$endpoint $method $summary_hash" >> /tmp/api-summary.found

        if [ -z $summary_hash ]; then
            echo "$endpoint does not appear in the documentation"
            continue
        fi

        if ! [[ $summary_hash =~ $soonest_hash ]]; then
            echo "invalid hash                   $method $endpoint: $summary_hash $soonest_hash"
            #return 1
            continue
        fi
    done
}

# find all methods in code and then make sure they are in docs
# also preform a hash check
code_subset_of_docs(){
    #summary_hash_latest "backend/calendar/cal.js" || exit 1

    files_to_check=()
    for file in $(find "${PROJECT_DIR}/backend" -name '*.js'); do
        # add all js files
        #echo "$file"
        if ! [[ "$file" =~ ".*_schema.js" ]]; then
            files_to_check+=("$file")
            #echo "check file $file"
            continue
        fi
    done

    for file in "${files_to_check[@]}"; do
        summary_hash_latest "$file" >> /tmp/hash_check.log
    done

    if [ -s "/tmp/hash_check.log" ]; then
        cat /tmp/hash_check.log
        return 1
    fi
}

# endpoints in docs are all found in the analyze code step
docs_subset_of_code(){
    local REAL_DOCS="${PROJECT_DIR}/docs/docs/api/api-summary.md"
    local FOUND_ENDPOINTS="/tmp/api-summary.found"

    cp "$REAL_DOCS" /tmp/api-summary.copy
    sed -i -e "1,6d" /tmp/api-summary.copy

    while read endpoint method hash; do
        #local sed_regex=$(echo "^| $endpoint | $method |.*hash=$hash$" | sed -r 's/\//\\\//g')
        #echo "$sed_regex"
        if ! grep -Eo "^\| $endpoint \| $method \|.*hash=$hash$" "/tmp/api-summary.copy" > /dev/null; then
            echo "missing something $endpoint $method $hash"
            printf "%s %s\n" "| $endpoint | $method | ...." >> /tmp/api-summary.missing
        else
            grep -v "| $endpoint | $method |" "/tmp/api-summary.copy" | sponge "/tmp/api-summary.copy"
        fi

        #sed -i "/$sed_regex/d" "/tmp/api-summary.copy"
    done <$FOUND_ENDPOINTS
    
    local invalid_summary="false"
    if [[ -s "/tmp/api-summary.copy" ]] ; then
        sed -r 's/(.*)/extra endpoints in docs        \1/g' "/tmp/api-summary.copy"
        invalid_summary="true"
    fi

    if [[ -s "/tmp/api-summary.missing" ]]; then
        sed -r 's/(.*)/missing endpoints from docs    \1/g' "/tmp/api-summary.missing"
        invalid_summary="true"
    fi

    if [[ $invalid_summary =~ "true" ]]; then
        return 1
    fi
}

main(){
    #summary_has_all_endpoints && echo "summary has all endpoints..." || exit 1
    #cd /project
    #set -x
    #summary_hash_latest '/project/backend/main.js'
    backend_has_no_changes || { echo "uncommited changes found in backend..." && exit 1; }
    
    #verify_frontend
    #summary_hash_latest "backend/main.js" || exit 1
    #git --no-pager blame --date=raw -l backend/main.js
    #stuff
    #get_router_ranges "backend/main.js"
    #summary_hash_latest "/project/backend/auth/login.js"
    #summary_hash_latest "/project/backend/calendar/cal.js"
    code_subset_of_docs
    docs_subset_of_code
    #cat /tmp/api-summary.copy
    #summary_hash_latest_new "/project/backend/calendar/cal.js"
}

main