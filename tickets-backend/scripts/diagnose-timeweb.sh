#!/bin/bash

SERVER="http://193.233.103.8:3000"
echo "🔍 Диагностика сервера Timeweb"
echo "======================================"
echo ""

# 1. Health check
echo "1️⃣ Проверка доступности сервера..."
HEALTH=$(curl -s "$SERVER/onelya/health" 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ Сервер доступен"
else
  echo "❌ Сервер недоступен"
  exit 1
fi
echo ""

# 2. Авторизация
echo "2️⃣ Тест авторизации (test@test.com / 123456)..."
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}')

echo "$LOGIN_RESPONSE" | grep -q "accessToken"
if [ $? -eq 0 ]; then
  echo "✅ Авторизация успешна"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:50}..."
else
  echo "❌ Ошибка авторизации"
  echo "   Ответ: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 3. Проверка профиля
echo "3️⃣ Проверка эндпоинта /me..."
ME_RESPONSE=$(curl -s "$SERVER/me" -H "Authorization: Bearer $TOKEN")
echo "$ME_RESPONSE" | grep -q '"email"'
if [ $? -eq 0 ]; then
  echo "✅ Профиль загружен"
  echo "   Email: $(echo "$ME_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)"
else
  echo "❌ Ошибка загрузки профиля"
  echo "   Ответ: $ME_RESPONSE"
fi
echo ""

# 4. Проверка бронирований
echo "4️⃣ Проверка эндпоинта /booking..."
BOOKING_RESPONSE=$(curl -s "$SERVER/booking" -H "Authorization: Bearer $TOKEN")
if [ "$BOOKING_RESPONSE" = "[]" ]; then
  echo "✅ Эндпоинт работает (бронирований нет)"
elif echo "$BOOKING_RESPONSE" | grep -q '\['; then
  COUNT=$(echo "$BOOKING_RESPONSE" | grep -o '"_id"' | wc -l)
  echo "✅ Эндпоинт работает (найдено бронирований: $COUNT)"
else
  echo "❌ Ошибка получения бронирований"
  echo "   Ответ: $BOOKING_RESPONSE"
fi
echo ""

# 5. Тест создания бронирования
echo "5️⃣ Тест создания бронирования..."
CREATE_RESPONSE=$(curl -s -X POST "$SERVER/booking/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "from": "SVO",
    "to": "LED",
    "date": "2025-12-10",
    "price": 5000,
    "flightNumber": "TEST123",
    "departTime": "10:00",
    "arriveTime": "11:30"
  }')

echo "$CREATE_RESPONSE" | grep -q '"ok":true'
if [ $? -eq 0 ]; then
  echo "✅ Бронирование создано"
  echo "   Ответ: ${CREATE_RESPONSE:0:200}..."
else
  echo "❌ Ошибка создания бронирования"
  echo "   Ответ: $CREATE_RESPONSE"
fi
echo ""

echo "======================================"
echo "📊 Результаты диагностики:"
echo ""
echo "Если все тесты ✅ - проблема в приложении"
echo "Если есть ❌ - проблема на сервере"
echo ""
echo "Следующие шаги:"
echo "1. Если /me возвращает 404 или 401 - обновите код на сервере"
echo "2. Если бронирование не создается - проверьте MongoDB подключение"
echo "3. Если все работает - проблема в мобильном приложении"
