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

    GIT_HASHES=$(git -C "$PROJECT_DIR" --no-pager blame --date=raw -l -L "$start_of_endpoint_code_line,$end_of_endpoint_code_line" "$target_file" | sed 's/^\^//' | grep -Eo "^[a-f0-9]+" | uniq )
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

get_all_endpoints_in_code(){
    #summary_hash_latest "backend/calendar/cal.js" || exit 1

    files_to_check=()
    for file in $(find "${PROJECT_DIR}/backend" -name '*.js'); do
        # add all js files
        if ! [[ "$file" =~ ".*_schema.js" ]]; then
            files_to_check+=("$file")
            #echo "check file $file"
            continue
        fi
    done

    for file in "${files_to_check[@]}"; do
        local START_OF_ENDPOINTS=$(grep -En 'router.(get|post|patch|delete)' "$file" | awk '{print $1}' FS=":")

        for start in $START_OF_ENDPOINTS; do
            local end=$(sed -n "$start,\$p" "$file" | grep -n -m 1 -E '^\}?\);$' | awk '{print $1}' FS=":" )
            end=$(($start + $end - 1))
            local soonest_hash=$(get_latest_git_hash_in_range "$start" "$end" "$file")

            local method=$(sed -r "$start!d" "$file" | sed -r 's/router.(get|post|patch|delete).*/\1/' | xargs | awk '{ print toupper($0) }' )
            local route=$(sed -r "$start!d" "$file" | sed -r "s/router.(get|post|patch|delete)\('(.*)'.*/\\2/g" | xargs )
            route=$(sed -r 's/\/$//g' <<< "$route" )
            
            if ! [[ $method =~ GET|POST|PATCH|DELETE ]] || [[ $route =~ .*route.* ]]; then
                echo "error extracting route and/or method from source code"
                echo "method: $method"
                echo "route: $route"
                echo "method or route is not found in range $start and $end of file $file"
                #return 1
                continue;
            fi

            local backend_folder=$( sed -r 's/^\/project\/backend\/(.*)\/.*.js$/\1/g' <<< "$file" )
            local route_prefix=$(json5 "${PROJECT_DIR}/backend/router_config.json" | jq -r ".[] | select(.dir == \"$backend_folder\") | .route ")

            if [ -z $route_prefix ]; then
                route_prefix='/'
            fi

            local endpoint=$(sed -r 's\^//\/\'<<< "${route_prefix}${route}") #edge case for any router loader which start with /
            jq -cn --arg endpoint "$endpoint" --arg method "$method" --arg hash "$soonest_hash" '{endpoint: $endpoint, method: $method, hash: $hash}' >> /tmp/api-summary.code #put endpoint first so we sort by endpoint at the end

        done
    done
    sort -o /tmp/api-summary.code /tmp/api-summary.code
}

get_all_endpoints_in_md(){
    DOCS_ROOT="${PROJECT_DIR}/docs/docs"

    all_md_files_string=$(yq '.nav | .. | select(. | type == "!!str")' ${PROJECT_DIR}/docs/mkdocs.yml)
    IFS=$'\n' read -d '' -a all_md_files_array <<< "$all_md_files_string"
    
    for file in "${all_md_files_array[@]}"; do
        FILE_TO_TEST="${DOCS_ROOT}/${file}"
        x=$(grep -m 2 -noE -e '^---$' "$FILE_TO_TEST" | awk '{print $1}' FS=":")
        IFS=$'\n' read -d '' -r start end <<< "$x"
        if [ -z ${end} ] || [ "$start" -ne 1 ] ; then
            continue
        fi

        #add 1 to strip the --- 
        #metadata is yaml format
        metadata=$(sed -n "$((start + 1)),$((end - 1))p" "$FILE_TO_TEST")
        yq -e 'has("properties")' <<< "$metadata" 2> /dev/null 1> /dev/null || continue
        yq -e '.properties | has("api-endpoint")' <<< "$metadata" 2> /dev/null 1> /dev/null || continue
        method=$(yq '.endpoint-info.http-method' <<< "$metadata")
        endpoint=$(yq '.endpoint-info.url' <<< "$metadata")
        hash=$(yq '.endpoint-info.latest-hash' <<< "$metadata") #not needed?

        jq -cn --arg endpoint "$endpoint" --arg method "$method" --arg hash "$hash" '{endpoint: $endpoint, method: $method, hash: $hash}' >> /tmp/api-summary.md #put endpoint first so we sort by endpoint at the end
    done

    sort -o /tmp/api-summary.md /tmp/api-summary.md
}

main(){
    #summary_has_all_endpoints && echo "summary has all endpoints..." || exit 1
    #cd /project
    #set -x
    #summary_hash_latest '/project/backend/main.js'
    backend_has_no_changes || { echo "uncommited changes found in backend..." && exit 1; }

    get_all_endpoints_in_code
    get_all_endpoints_in_md
    only_code=$(jq -rn --slurpfile code /tmp/api-summary.code --slurpfile md /tmp/api-summary.md '$code - $md')
    only_md=$(jq -rn --slurpfile code /tmp/api-summary.code --slurpfile md /tmp/api-summary.md '$md - $code')
    both=$(jq -rn --slurpfile code /tmp/api-summary.code --slurpfile md /tmp/api-summary.md '($md + $code) - ($md - $code) - ($code - $md) | unique ')
    diff_list=$(jq -rn --argjson c "$only_code" --argjson m "$only_md" '(($c | map(. + {source: "code"})) + ($m | map(. + {source: "markdown"}))) | group_by(.endpoint, .method) ')
    for diff_pair_b64 in $(jq -rnc --argjson d "$diff_list" '$d[] | @base64'); do
        
        local diff_pair=$(echo "${diff_pair_b64}" | base64 --decode)
        local len=$(jq -rn --argjson x "$diff_pair" '$x | length')
        local endpoint=$(jq -rn --argjson x "$diff_pair" '$x[0].endpoint')
        local method=$(jq -rn --argjson x "$diff_pair" '$x[0].method')

        if [ "$len" -eq 2 ]; then
            

            local first_hash=$(jq -rn --argjson x "$diff_pair" '$x[0].hash')
            local first_source=$(jq -rn --argjson x "$diff_pair" '$x[0].source')

            local second_hash=$(jq -rn --argjson x "$diff_pair" '$x[1].hash')
            local second_source=$(jq -rn --argjson x "$diff_pair" '$x[1].source')

            echo "hash mismatch                                 $endpoint $method $first_source=$first_hash $second_source=$second_hash"

            continue;
        fi
        
        local available_hash=$(jq -rn --argjson x "$diff_pair" '$x[0].hash')
        local available_source=$(jq -rn --argjson x "$diff_pair" '$x[0].source')

        if [ "$available_source" = markdown ]; then
            echo "extra endpoint found in markdown docs         $endpoint $method git hash: $available_hash"
            continue
        fi

        if [ "$available_source" = code ]; then
            echo "markdown docs missing endpoint                $endpoint $method git hash: $available_hash"
            continue
        fi

    done
    
    #verify_frontend
    #summary_hash_latest "backend/main.js" || exit 1
    #git --no-pager blame --date=raw -l backend/main.js
    #stuff
    #get_router_ranges "backend/main.js"
    #summary_hash_latest "/project/backend/auth/login.js"
    #summary_hash_latest "/project/backend/calendar/cal.js"
    #code_subset_of_docs
    #docs_subset_of_code
    #validate_md_documentation
    #cat /tmp/api-summary.copy
    #summary_hash_latest_new "/project/backend/calendar/cal.js"
}

main