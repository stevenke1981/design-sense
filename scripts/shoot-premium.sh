#!/usr/bin/env bash
# Render premium web templates to docs/images/premium (needs google-chrome).
set -e; cd "$(dirname "$0")/.."; mkdir -p docs/images/premium
shot(){ google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=$3 --screenshot=docs/images/premium/$2.png "file://$PWD/templates/premium/$1" 2>/dev/null; }
for t in dark light; do
  shot "web/dashboard.html?theme=$t" dashboard-$t 1440,820
  shot "web/login.html?theme=$t" login-$t 1200,820
  shot "web/landing.html?theme=$t" landing-$t 1440,760
done
[ -f templates/premium/social/post.svg ] && shot social/post.svg social-post 1080,1080 || true
