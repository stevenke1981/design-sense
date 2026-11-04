#!/bin/sh
# Thin wrapper: run from a local clone/zip. Never pipe this from curl.
exec node "$(dirname "$0")/install.mjs" "$@"
