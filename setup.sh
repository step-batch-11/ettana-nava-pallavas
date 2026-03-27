#! /bin/sh

cp ./hooks/* ./.git/hooks/
chmod +x .git/hooks/pre-commit
