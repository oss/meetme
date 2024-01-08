PROJECT_DIR="/project"
backend_has_no_changes(){
    if [[ $(git -C "$PROJECT_DIR" status --porcelain backend) ]]; then
        return 1
    fi
}

summary_has_all_endpoints(){
    curl -X GET -sk "https://api.localhost.edu" > response.json

    cp "${PROJECT_DIR}/docs/docs/api/api-summary.md" "/tmp/api-summary.copy"
    cp /dev/null /tmp/api-summary.missing
    sed -i -e "1,6d" /tmp/api-summary.copy

    jq -cr '.paths[]' response.json | while read -r method path; do
        #echo "$method, $path"
        if ! grep "| $path | $method |" "${PROJECT_DIR}/docs/docs/api/api-summary.md" > /dev/null; then
            #echo "missing $method $path"
            printf "%-80s %s\n" "| $path | $method |" "missing from docs" >> /tmp/api-summary.missing
        else
            grep -v "| $path | $method |" "/tmp/api-summary.copy" | sponge "/tmp/api-summary.copy"
        fi
    done

    local invalid_summary="false"
    if [[ -s "/tmp/api-summary.copy" ]] ; then
        echo "there are extra invalid endpoints in the summary table"
        cat "/tmp/api-summary.copy" | sed 's/\(.\{75\}\).*/\1.../' | xargs -I ? printf "%-80s %s\n" "?" "invalid endpoint in docs"
        invalid_summary="true"
    fi

    if [[ -s "/tmp/api-summary.missing" ]]; then
        echo "there are some endpoints missing from the summary table"
        cat /tmp/api-summary.missing
        invalid_summary="true"
    fi

    if [[ $invalid_summary =~ "true" ]]; then
        return 1
    fi
}

summary_hash_latest(){
    for start_of_endpoint_code_line in $(cat "$1" | grep -En 'router.(get|post|patch|delete)' | awk '{print $1}' FS=":"); do
        #echo "$start_of_endpoint_code_line"
        length=0
        stack=0
        line_text=$(sed "${start_of_endpoint_code_line}q;d" "$1")
        add=$(grep -o '(' <<< "$line_text" | wc -l | xargs )
        sub=$(grep -o ')' <<< "$line_text" | wc -l | xargs )
        stack=$(($stack + $add - $sub))

        while [[ $stack -ne 0 ]]; do
            length=$(($length + 1))

            #remove text inside quotes, remove comments
            line_text=$(sed "$(($start_of_endpoint_code_line + $length))q;d" "$1" | sed -r "s/\".*\"/\"\"/g" | sed -r "s/'.*'/''/g" | sed -Er 's/^([ ]+)?#/rep/g' )
            add=$(grep -o '(' <<< "$line_text" | wc -l | xargs )
            sub=$(grep -o ')' <<< "$line_text" | wc -l | xargs )
            stack=$(($stack + $add - $sub))
        done
        end_of_endpoint_code_line=$(($start_of_endpoint_code_line + $length))
        
        GIT_HASHES=$(git -C "$PROJECT_DIR" --no-pager blame --date=raw -l -L "$start_of_endpoint_code_line,$end_of_endpoint_code_line" "$1" | grep -Eo "^[a-f0-9]+" | uniq )
        local soonest_hash=""
        local soonest_hash_time=0
        for hash in $GIT_HASHES; do
            TIME=$(git -C "$PROJECT_DIR" --no-pager show --no-patch --no-notes --pretty='%at' "$hash")
            if [[ $TIME -gt $soonest_hash_time ]];then
                soonest_hash=$hash
                soonest_hash_time=$TIME
            fi
        done
        local method=$(sed -r "$start_of_endpoint_code_line!d" "$1" | sed -r 's/router.(get|post|patch|delete).*/\1/' | xargs | awk '{ print toupper($0) }' )
        local route=$(sed -r "$start_of_endpoint_code_line!d" "$1" | sed -r "s/router.(get|post|patch|delete)\('(.*)'.*/\\2/g" | xargs )
        route=$(sed -r 's/\/$//g' <<< "$route" )

        if ! [[ $method =~ GET|POST|PATCH|DELETE ]] || [[ $route =~ .*route.* ]]; then
            echo "error extracting route and/or method from source code"
            echo "method: $method"
            echo "route: $route"
            echo "method or route is not found in range $start_of_endpoint_code_line and $end_of_endpoint_code_line of file $1"
            #return 1
            continue;
        fi
        #
        local backend_folder=$( sed -r 's/^\/project\/backend\/(.*)\/.*.js$/\1/g' <<< "$1" )
        local route_prefix=$(jq -r ".[] | select(.dir == \"$backend_folder\") | .route " "${PROJECT_DIR}/backend/router_config.json")
        if [[ $backend_folder =~ .*/testing$ ]]; then
            echo "testing domain"
            route_prefix="/test"
        fi
        #echo "soonest_hash: $soonest_hash"
        #echo "soonest_hash_time: $soonest_hash_time"
        #echo "line start:$(sed -r "$start_of_endpoint_code_line!d" "$1" )" 
        #echo "method:$method"
        #echo "route:$route"
        #echo "backend_folder:$backend_folder"
        #echo "route_prefix:$route_prefix"

        if ! [[ $(grep "$method ${route_prefix}${route}" response.json) ]]; then
            echo "${method} ${route_prefix}${route} not loaded in backend but is in code, possibly a comment... skipping"
            echo "on lines $start_of_endpoint_code_line from $end_of_endpoint_code_line"
            #return 0
            continue
        fi

        #echo "${route_prefix}${route}"
        local summary_hash=$(grep -Eo "^\| ${route_prefix}${route} \| $method \|.*hash=[a-f0-9]+$" "${PROJECT_DIR}/docs/docs/api/api-summary.md" | sed -r 's/.*hash=//' )
        if ! [[ $summary_hash =~ $soonest_hash ]]; then
            echo "hash mismatch for $method ${route_prefix}$route"
            echo "docs hash: $summary_hash"
            echo "real hash: $soonest_hash"
            #return 1
            continue
        fi
    done
}

verify_backend(){
    backend_has_no_changes || { echo "uncommited changes found in backend..." && exit 1; }
    summary_has_all_endpoints && echo "summary has all endpoints..." || exit 1

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
        echo "-- testing $file -"
        summary_hash_latest "$file"
        echo ""
    done
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

main(){
    #cd /project
    #set -x
    verify_backend
    #verify_frontend
    #summary_hash_latest "backend/main.js" || exit 1
    #git --no-pager blame --date=raw -l backend/main.js
    #stuff
    #get_router_ranges "backend/main.js"
}

main