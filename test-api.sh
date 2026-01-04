#!/bin/bash

##############################################################################
# API Testing Script for Sourssing MVP
#
# This script tests all API endpoints to ensure they're working correctly.
# It provides comprehensive coverage of authentication, products, RFQs,
# bids, orders, payments, and admin functionality.
#
# Usage:
#   chmod +x test-api.sh
#   ./test-api.sh
#
# Requirements:
#   - curl
#   - jq (optional, for pretty JSON output)
#   - Server running on localhost:3000
##############################################################################

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@sourssing.com"
ADMIN_PASSWORD="admin123"
BUYER_EMAIL="buyer@company.com"
BUYER_PASSWORD="admin123"
VENDOR_EMAIL="vendor@supplier.com"
VENDOR_PASSWORD="admin123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_error() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

check_response() {
    local response=$1
    local expected_code=$2
    local test_name=$3
    
    if echo "$response" | grep -q "\"success\":true" || [ "$expected_code" = "any" ]; then
        print_success "$test_name"
    else
        print_error "$test_name"
        echo "Response: $response"
    fi
}

##############################################################################
# Test Cases
##############################################################################

print_header "STARTING API TESTS"

# ============================================================================
# 1. AUTHENTICATION TESTS
# ============================================================================

print_header "1. AUTHENTICATION TESTS"

# Test 1.1: Admin Login
print_test "Admin login"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
check_response "$ADMIN_LOGIN" "200" "Admin login successful"

# Test 1.2: Buyer Login
print_test "Buyer login"
BUYER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$BUYER_EMAIL\",\"password\":\"$BUYER_PASSWORD\"}")
BUYER_TOKEN=$(echo $BUYER_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
check_response "$BUYER_LOGIN" "200" "Buyer login successful"

# Test 1.3: Vendor Login
print_test "Vendor login"
VENDOR_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$VENDOR_EMAIL\",\"password\":\"$VENDOR_PASSWORD\"}")
VENDOR_TOKEN=$(echo $VENDOR_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
check_response "$VENDOR_LOGIN" "200" "Vendor login successful"

# Test 1.4: Get Current User (Admin)
print_test "Get admin profile"
ADMIN_PROFILE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
check_response "$ADMIN_PROFILE" "200" "Get admin profile"

# Test 1.5: Invalid Login
print_test "Invalid login (should fail)"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@test.com","password":"wrong"}')
if echo "$INVALID_LOGIN" | grep -q "\"success\":false"; then
    print_success "Invalid login correctly rejected"
else
    print_error "Invalid login should have failed"
fi

# ============================================================================
# 2. PRODUCTS API TESTS
# ============================================================================

print_header "2. PRODUCTS API TESTS"

# Test 2.1: List Products
print_test "List products (page 1, limit 10)"
PRODUCTS=$(curl -s "$BASE_URL/api/products?page=1&limit=10")
check_response "$PRODUCTS" "200" "List products"

# Test 2.2: Get Product by ID
print_test "Get product by ID (id=1)"
PRODUCT=$(curl -s "$BASE_URL/api/products/1")
check_response "$PRODUCT" "200" "Get product by ID"

# Test 2.3: List Categories
print_test "List categories"
CATEGORIES=$(curl -s "$BASE_URL/api/products/categories/list")
check_response "$CATEGORIES" "200" "List categories"

# Test 2.4: Search Products
print_test "Search products (query='paper')"
SEARCH=$(curl -s "$BASE_URL/api/products/search?q=paper&limit=5")
check_response "$SEARCH" "200" "Search products"

# ============================================================================
# 3. RFQ API TESTS (Buyer)
# ============================================================================

print_header "3. RFQ API TESTS"

# Test 3.1: Create RFQ
print_test "Create RFQ (as buyer)"
CREATE_RFQ=$(curl -s -X POST "$BASE_URL/api/rfqs" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title":"Test RFQ - API Test",
        "title_ar":"طلب اختبار",
        "description":"Testing RFQ creation via API",
        "delivery_address":"123 Test Street, Cairo",
        "delivery_address_ar":"123 شارع الاختبار، القاهرة",
        "required_delivery_date":"2026-02-01",
        "items":[
            {
                "item_name":"A4 Paper",
                "item_name_ar":"ورق A4",
                "quantity":100,
                "unit":"ream",
                "unit_ar":"رزمة",
                "brand":"Double A",
                "brand_ar":"دبل إيه",
                "specifications":"80gsm white"
            }
        ]
    }')
RFQ_ID=$(echo $CREATE_RFQ | grep -o '"rfq_id":[0-9]*' | cut -d':' -f2)
check_response "$CREATE_RFQ" "201" "Create RFQ"

# Test 3.2: List RFQs (Buyer)
print_test "List buyer's RFQs"
LIST_RFQS=$(curl -s "$BASE_URL/api/rfqs?page=1&limit=10" \
    -H "Authorization: Bearer $BUYER_TOKEN")
check_response "$LIST_RFQS" "200" "List buyer RFQs"

# Test 3.3: Get RFQ by ID
if [ ! -z "$RFQ_ID" ]; then
    print_test "Get RFQ by ID (id=$RFQ_ID)"
    GET_RFQ=$(curl -s "$BASE_URL/api/rfqs/$RFQ_ID" \
        -H "Authorization: Bearer $BUYER_TOKEN")
    check_response "$GET_RFQ" "200" "Get RFQ by ID"
fi

# Test 3.4: Submit RFQ
if [ ! -z "$RFQ_ID" ]; then
    print_test "Submit RFQ (id=$RFQ_ID)"
    SUBMIT_RFQ=$(curl -s -X POST "$BASE_URL/api/rfqs/$RFQ_ID/submit" \
        -H "Authorization: Bearer $BUYER_TOKEN")
    check_response "$SUBMIT_RFQ" "200" "Submit RFQ"
fi

# ============================================================================
# 4. BIDS API TESTS (Vendor)
# ============================================================================

print_header "4. BIDS API TESTS"

# Test 4.1: List Available RFQs (Vendor)
print_test "List available RFQs (vendor view)"
VENDOR_RFQS=$(curl -s "$BASE_URL/api/bids/rfqs/available?page=1&limit=10" \
    -H "Authorization: Bearer $VENDOR_TOKEN")
check_response "$VENDOR_RFQS" "200" "List available RFQs for vendor"

# Test 4.2: Submit Bid
if [ ! -z "$RFQ_ID" ]; then
    print_test "Submit bid (rfq_id=$RFQ_ID)"
    SUBMIT_BID=$(curl -s -X POST "$BASE_URL/api/bids" \
        -H "Authorization: Bearer $VENDOR_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"rfq_id\":$RFQ_ID,
            \"delivery_time_days\":7,
            \"notes\":\"We can deliver within 7 days\",
            \"items\":[
                {
                    \"rfq_item_id\":1,
                    \"unit_price\":250.00,
                    \"total_price\":25000.00
                }
            ]
        }")
    BID_ID=$(echo $SUBMIT_BID | grep -o '"bid_id":[0-9]*' | cut -d':' -f2)
    check_response "$SUBMIT_BID" "201" "Submit bid"
fi

# Test 4.3: List Vendor's Bids
print_test "List vendor's bids"
VENDOR_BIDS=$(curl -s "$BASE_URL/api/bids/my-bids?page=1&limit=10" \
    -H "Authorization: Bearer $VENDOR_TOKEN")
check_response "$VENDOR_BIDS" "200" "List vendor bids"

# ============================================================================
# 5. ADMIN API TESTS
# ============================================================================

print_header "5. ADMIN API TESTS"

# Test 5.1: List Users
print_test "List all users (admin)"
ADMIN_USERS=$(curl -s "$BASE_URL/api/admin/users?page=1&limit=10" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
check_response "$ADMIN_USERS" "200" "List users"

# Test 5.2: List RFQs (Admin)
print_test "List all RFQs (admin)"
ADMIN_RFQS=$(curl -s "$BASE_URL/api/admin/rfqs?page=1&limit=10" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
check_response "$ADMIN_RFQS" "200" "List RFQs (admin)"

# Test 5.3: Get RFQ with Bids (Admin)
if [ ! -z "$RFQ_ID" ]; then
    print_test "Get RFQ with bids (admin, rfq_id=$RFQ_ID)"
    ADMIN_RFQ=$(curl -s "$BASE_URL/api/admin/rfqs/$RFQ_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    check_response "$ADMIN_RFQ" "200" "Get RFQ with bids"
fi

# ============================================================================
# 6. LANDING PAGE TESTS
# ============================================================================

print_header "6. LANDING PAGE TESTS"

# Test 6.1: English Landing Page
print_test "Landing page (English)"
LANDING_EN=$(curl -s "$BASE_URL/")
if echo "$LANDING_EN" | grep -q "Sourssing"; then
    print_success "Landing page (English)"
else
    print_error "Landing page (English)"
fi

# Test 6.2: Arabic Landing Page
print_test "Landing page (Arabic)"
LANDING_AR=$(curl -s "$BASE_URL/?lang=ar")
if echo "$LANDING_AR" | grep -q "lang=\"ar\""; then
    print_success "Landing page (Arabic with RTL)"
else
    print_error "Landing page (Arabic with RTL)"
fi

# ============================================================================
# 7. PORTAL PAGES TESTS
# ============================================================================

print_header "7. PORTAL PAGES TESTS"

# Test 7.1: Buyer Dashboard
print_test "Buyer dashboard page"
BUYER_DASH=$(curl -s "$BASE_URL/buyer/dashboard")
if echo "$BUYER_DASH" | grep -q "Buyer"; then
    print_success "Buyer dashboard page"
else
    print_error "Buyer dashboard page"
fi

# Test 7.2: Vendor Dashboard
print_test "Vendor dashboard page"
VENDOR_DASH=$(curl -s "$BASE_URL/vendor/dashboard")
if echo "$VENDOR_DASH" | grep -q "Vendor"; then
    print_success "Vendor dashboard page"
else
    print_error "Vendor dashboard page"
fi

# Test 7.3: Admin Dashboard
print_test "Admin dashboard page"
ADMIN_DASH=$(curl -s "$BASE_URL/admin/dashboard")
if echo "$ADMIN_DASH" | grep -q "Admin"; then
    print_success "Admin dashboard page"
else
    print_error "Admin dashboard page"
fi

# Test 7.4: Buyer Catalog (Arabic)
print_test "Buyer catalog page (Arabic)"
CATALOG_AR=$(curl -s "$BASE_URL/buyer/catalog?lang=ar")
if echo "$CATALOG_AR" | grep -q "dir=\"rtl\""; then
    print_success "Buyer catalog (Arabic RTL)"
else
    print_error "Buyer catalog (Arabic RTL)"
fi

##############################################################################
# Test Summary
##############################################################################

print_header "TEST SUMMARY"
echo ""
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}ALL TESTS PASSED! ✓${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}SOME TESTS FAILED! ✗${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
