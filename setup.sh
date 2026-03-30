#! /bin/bash

cp ./hooks/* ./.git/hooks/

chmod u+x ./.git/hooks/pre-commit
chmod u+x ./.git/hooks/prepare-commit-msg