#!/usr/bin/env bash

if [[ $# -eq 0 ]] ; then
    echo 'Pass this script a YAML or templated YAML file and it will append command fields below each image field. Requires docker.

Due to how Go templates work, the value of the command will be a sequence with no quotes or commas. It is up to you to add in the quotes (to avoid YAML number parsing) and commas. You should probably also remove the command field in places it is already defined.'
    exit 0
fi

for image in `sed -ne 's/^\s*image:\s*\(\S\{1,\}\)\s*/\1/p' "${1}"`; do
  docker pull "$image"
done

sed -i'' -e 's/^\(\s*\)\(image:\s*\(\S\{1,\}\)\)$/echo "\1\2"\
  echo "\1command: `docker image inspect -f \"{{.Config.Cmd}}\" \3`"/e' "${1}"
