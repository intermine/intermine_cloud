#! /bin/bash

RED='\033[0;31m'
GREEN='\033[0;33m'
NC='\033[0m' # No Color

if [[ -z "$CONDA_SHELL_PATH" ]]; then
  echo -e "${RED}CONDA_SHELL_PATH is not set or set to empty str!!${NC}"
  echo -e "Add CONDA_SHELL_PATH using following command:"
  printf "\n"
  echo -e "${GREEN}export \$(cat .setup.env | xargs)${NC}"
  printf "\n"
else
  source $CONDA_SHELL_PATH
  conda activate imcloud
fi
