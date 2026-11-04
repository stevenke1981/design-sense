# Thin wrapper: run from a local clone/zip. Never pipe this from the web.
node (Join-Path $PSScriptRoot 'install.mjs') @args
