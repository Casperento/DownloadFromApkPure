#!/bin/bash

folder_path="page_files"
node_command="node app.js"

logFile="logFile.txt"

for file in "$folder_path"/*; do
    if [[ -f "$file" ]]; then
        echo "$file"
	echo "$file" >> "$logFile"
        $node_command "$file"
        echo "Waiting 60 seconds to restart script..."
        sleep 60
    fi
done
