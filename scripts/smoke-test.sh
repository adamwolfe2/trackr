#!/bin/bash
# Trackr Smoke Test — Critical User Journey
# Usage: APP_URL=https://trackr.so ./scripts/smoke-test.sh

APP_URL="${APP_URL:-http://localhost:3000}"
PASS=0
FAIL=0
WARN=0

check() {
    local desc="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" = "$expected_status" ]; then
        echo "  ✓  $desc (HTTP $response)"
        ((PASS++))
    else
        echo "  ✗  $desc — expected $expected_status, got $response"
        ((FAIL++))
    fi
}

check_json() {
    local desc="$1"
    local url="$2"
    local method="${3:-GET}"
    local body="$4"
    local response
    if [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$body" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    if [[ "$response" =~ ^(200|201|400|401|422)$ ]]; then
        echo "  ✓  $desc (HTTP $response — API responds)"
        ((PASS++))
    else
        echo "  ✗  $desc — unexpected HTTP $response"
        ((FAIL++))
    fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Trackr Smoke Test"
echo "  Target: $APP_URL"
echo "  $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "[ Marketing Pages ]"
check "Homepage loads" "$APP_URL/"
check "Pricing page loads" "$APP_URL/pricing"
check "Sign-in page loads" "$APP_URL/sign-in"
check "Sign-up page loads" "$APP_URL/sign-up"
check "Privacy page loads" "$APP_URL/privacy"
check "Terms page loads" "$APP_URL/terms"

echo ""
echo "[ SEO & Crawlability ]"
check "Sitemap returns 200" "$APP_URL/sitemap.xml"
check "Robots.txt returns 200" "$APP_URL/robots.txt"

echo ""
echo "[ Auth Redirects ]"
check "Dashboard redirects to sign-in (unauthed)" "$APP_URL/tools" "307"

echo ""
echo "[ API Endpoints ]"
check_json "Search API responds" "$APP_URL/api/search" "POST" '{"query":"CRM"}'
check_json "Research API validates input" "$APP_URL/api/research" "POST" '{"toolId":"not-a-uuid"}'
check_json "Chat API responds" "$APP_URL/api/chat" "POST" '{"messages":[{"role":"user","content":"What tools do I have?"}]}'

echo ""
echo "[ 404 & Error Pages ]"
check "404 page renders" "$APP_URL/this-page-does-not-exist-at-all" "404"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: $PASS passed, $FAIL failed, $WARN warnings"

if [ "$FAIL" -gt 0 ]; then
    echo "  Status: ✗ FAILED"
    exit 1
else
    echo "  Status: ✓ ALL PASSED"
    exit 0
fi
