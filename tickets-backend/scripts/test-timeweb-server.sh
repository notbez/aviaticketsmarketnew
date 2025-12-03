#!/bin/bash

SERVER="http://193.233.103.8:3000"

echo "🔍 Тестирование сервера на Timeweb"
echo "=================================="
echo ""

# 1. Health check
echo "1️⃣ Health check..."
curl -s "$SERVER/onelya/health" | head -5
echo -e "\n"

# 2. Login
echo "2️⃣ Авторизация..."
TOKEN=$(curl -s -X POST "$SERVER/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' | \
  grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Не удалось получить токен"
  exit 1
fi

echo "✓ Токен получен: ${TOKEN:0:50}..."
echo ""

# 3. Get profile
echo "3️⃣ Получение профиля..."
PROFILE=$(curl -s "$SERVER/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFILE" | head -10
echo ""

# 4. Get bookings
echo "4️⃣ Получение бронирований..."
BOOKINGS=$(curl -s "$SERVER/booking" \
  -H "Authorization: Bearer $TOKEN")

echo "$BOOKINGS"
echo ""

echo "=================================="
echo "✓ Тестирование завершено"
