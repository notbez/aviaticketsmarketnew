# 📁 ПОЛНАЯ СТРУКТУРА ПРОЕКТА AVIATICKETS

## 🎯 Обзор проекта

Приложение для бронирования авиабилетов с интеграцией Onelya API, состоящее из:
- **Frontend**: React Native (Expo) мобильное приложение
- **Backend**: NestJS REST API сервер
- **Database**: MongoDB Atlas (облачная база данных)
- **External API**: Onelya API для поиска рейсов

---

## 📱 FRONTEND (aviatickets-demo/)

### Структура папок:

```
aviatickets-demo/
├── screens/                    # Экраны приложения (20 файлов)
│   ├── HomeScreen.js           # Главный экран с поиском
│   ├── SearchScreen.js         # Расширенный поиск
│   ├── ResultsScreen.js        # Результаты поиска рейсов
│   ├── SelectCityScreen.js     # Выбор города
│   ├── FlightDetailsScreen.js  # Детали рейса
│   ├── SeatSelectionScreen.js  # Выбор места
│   ├── PassengerInfoScreen.js  # Данные пассажира
│   ├── BookingScreen.js        # Подтверждение бронирования
│   ├── PaymentScreen.js        # Оплата
│   ├── TicketsScreen.js        # Мои билеты
│   ├── ProfileScreen.js        # Профиль пользователя
│   ├── AccountScreen.js        # Редактирование аккаунта
│   ├── PaymentsScreen.js       # История платежей
│   ├── SettingsScreen.js       # Настройки
│   ├── LoginScreen.js          # Вход
│   ├── SignUpScreen.js         # Регистрация
│   ├── LogoutScreen.js         # Выход (очистка данных)
│   ├── FaqScreen.js            # FAQ
│   ├── SupportScreen.js        # Чат с поддержкой
│   ├── SupportOptionsScreen.js # Опции поддержки
│   └── SplashScreen.js         # Экран загрузки
│
├── navigation/                 # Навигация
│   ├── RootNavigation.js       # Корневой Stack Navigator
│   └── BottomTabs.js           # Нижние вкладки (Home, Tickets, Profile)
│
├── contexts/                   # React Context API
│   └── AuthContext.js          # Управление авторизацией (token, user, login, logout)
│
├── lib/                        # Утилиты
│   └── api.js                  # Централизованный API клиент
│
├── constants/                  # Константы
│   ├── api.js                  # API_BASE = 'http://193.233.103.8:3000/api'
│   └── airports.js             # Список аэропортов
│
├── components/                 # Переиспользуемые компоненты
│   ├── FlightCard.js           # Карточка рейса
│   ├── Input.js                # Поле ввода
│   ├── PrimaryButton.js        # Основная кнопка
│   └── LoadingOverlay.js       # Индикатор загрузки
│
├── data/                       # Статические данные
│   └── airports.js             # База аэропортов
│
├── assets/                     # Ресурсы
│   ├── icons/                  # Иконки вкладок
│   ├── icon.png                # Иконка приложения
│   ├── splash-icon.png         # Splash screen
│   └── ...
│
├── App.js                      # Точка входа приложения
├── app.json                    # Конфигурация Expo
├── package.json                # Зависимости
└── code.json                   # Тестовые данные рейсов
```

### Ключевые файлы Frontend:

| Файл | Описание |
|------|----------|
| `constants/api.js` | API_BASE URL сервера |
| `lib/api.js` | Централизованная функция для всех API запросов |
| `contexts/AuthContext.js` | Управление состоянием авторизации |
| `screens/LoginScreen.js` | Авторизация пользователя |
| `screens/BookingScreen.js` | Создание бронирования |
| `screens/TicketsScreen.js` | Список забронированных билетов |
| `screens/AccountScreen.js` | Редактирование профиля |

---

## 🖥️ BACKEND (tickets-backend/)

### Структура папок:

```
tickets-backend/
├── src/
│   ├── auth/                           # Модуль авторизации
│   │   ├── dto/
│   │   │   ├── login.dto.ts            # DTO для входа
│   │   │   ├── register.dto.ts         # DTO для регистрации
│   │   │   └── oauth.dto.ts            # DTO для OAuth
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts       # JWT Guard для защиты роутов
│   │   ├── auth.controller.ts          # POST /api/auth/login, /api/auth/register
│   │   ├── auth.service.ts             # Логика авторизации, хеширование паролей
│   │   └── auth.module.ts              # Модуль авторизации
│   │
│   ├── users/                          # Модуль пользователей
│   │   ├── dto/
│   │   │   └── update-user.dto.ts      # DTO для обновления профиля
│   │   ├── users.controller.ts         # GET /api/me, PUT /api/me
│   │   ├── users.service.ts            # Логика работы с пользователями
│   │   └── users.module.ts             # Модуль пользователей
│   │
│   ├── booking/                        # Модуль бронирований
│   │   ├── booking.controller.ts       # POST /api/booking/create, GET /api/booking
│   │   ├── booking.service.ts          # Логика бронирований, интеграция с Onelya
│   │   └── booking.module.ts           # Модуль бронирований
│   │
│   ├── flights/                        # Модуль поиска рейсов
│   │   ├── flights.controller.ts       # GET/POST /api/flights/search
│   │   ├── flights.service.ts          # Логика поиска рейсов
│   │   ├── direct-search.controller.ts # Прямой поиск через Onelya
│   │   └── flights.module.ts           # Модуль рейсов
│   │
│   ├── onelya/                         # Модуль интеграции с Onelya API
│   │   ├── dto/
│   │   │   ├── avia-search.dto.ts      # DTO для поиска рейсов
│   │   │   └── order-reservation.dto.ts # DTO для бронирований
│   │   ├── interceptors/
│   │   │   └── onelya-logging.interceptor.ts # Логирование запросов
│   │   ├── onelya.controller.ts        # Эндпоинты Onelya API
│   │   ├── onelya.service.ts           # HTTP клиент для Onelya
│   │   ├── onelya.health.controller.ts # Проверка доступности Onelya
│   │   └── onelya.module.ts            # Модуль Onelya
│   │
│   ├── faq/                            # Модуль FAQ
│   │   ├── faq.controller.ts           # GET /api/faq
│   │   ├── faq.service.ts              # Логика FAQ
│   │   ├── faq-seed.service.ts         # Заполнение тестовыми данными
│   │   └── faq.module.ts               # Модуль FAQ
│   │
│   ├── support/                        # Модуль поддержки
│   │   ├── support.controller.ts       # GET/POST /api/support/messages
│   │   ├── support.service.ts          # Логика чата поддержки
│   │   └── support.module.ts           # Модуль поддержки
│   │
│   ├── schemas/                        # MongoDB схемы (Mongoose)
│   │   ├── user.schema.ts              # Схема пользователя
│   │   ├── booking.schema.ts           # Схема бронирования
│   │   ├── faq.schema.ts               # Схема FAQ
│   │   └── support-message.schema.ts   # Схема сообщений поддержки
│   │
│   ├── providers/                      # Провайдеры
│   │   ├── provider.interface.ts       # Интерфейс провайдера
│   │   └── onelya.provider.ts          # Провайдер Onelya
│   │
│   ├── assets/                         # Ресурсы
│   │   └── fonts/
│   │       └── NotoSans-Regular.ttf    # Шрифт для PDF
│   │
│   ├── main.ts                         # Точка входа (app.setGlobalPrefix('api'))
│   ├── app.module.ts                   # Главный модуль приложения
│   ├── app.controller.ts               # Главный контроллер
│   └── app.service.ts                  # Главный сервис
│
├── scripts/                            # Утилиты (созданы локально)
│   ├── seed-test-user.js               # Создание пользователя (локальная БД)
│   ├── seed-atlas-user.js              # Создание пользователя (MongoDB Atlas)
│   ├── check-user.js                   # Проверка пользователя
│   ├── check-bookings.js               # Проверка бронирований
│   ├── check-atlas-data.js             # Проверка данных в Atlas
│   ├── check-connection.js             # Проверка подключения к БД
│   ├── create-test-booking.js          # Создание тестового бронирования
│   ├── full-diagnosis.js               # Полная диагностика системы
│   ├── test-jwt.js                     # Тест JWT токенов
│   ├── diagnose-timeweb.sh             # Диагностика сервера Timeweb
│   └── test-server.sh                  # Тест API сервера
│
├── .env                                # Переменные окружения
├── .env.production                     # Production конфигурация
├── package.json                        # Зависимости
├── tsconfig.json                       # TypeScript конфигурация
├── nest-cli.json                       # NestJS CLI конфигурация
└── ecosystem.config.js                 # PM2 конфигурация
```

### Ключевые файлы Backend:

| Файл | Описание |
|------|----------|
| `src/main.ts` | Точка входа, настройка Swagger, **app.setGlobalPrefix('api')** |
| `.env` | JWT_SECRET, MONGO_URI, Onelya credentials |
| `src/auth/auth.service.ts` | Логика авторизации, хеширование паролей |
| `src/booking/booking.service.ts` | Создание бронирований, интеграция с Onelya |
| `src/schemas/user.schema.ts` | MongoDB схема пользователя |
| `src/schemas/booking.schema.ts` | MongoDB схема бронирования |

---

## 📚 ДОКУМЕНТАЦИЯ

Созданные файлы документации:

```
aviaticketsmarketnew/
├── README.md                           # Основная документация (этот файл)
├── PROJECT_STRUCTURE_FULL.md           # Полная структура проекта
├── FIX_ROUTES.md                       # Исправление 404 ошибок
├── COMPLETE_SOLUTION.md                # Полное решение проблем
├── AUTH_FIXED.md                       # Исправления авторизации
├── DIAGNOSIS.md                        # Диагностика проблем
├── DEPLOY_INSTRUCTIONS.md              # Инструкции по развертыванию
├── UPDATE_SERVER.md                    # Обновление сервера
├── START_LOCAL.md                      # Запуск локально
├── FINAL_SOLUTION.md                   # Финальное решение
├── CLEAR_APP_DATA.md                   # Очистка данных приложения
├── CHECK_SERVER.md                     # Проверка сервера
├── FIX_NOW.txt                         # Быстрое исправление
├── FIX_SERVER.txt                      # Исправление сервера
└── FINAL_FIX.txt                       # Финальное исправление
```

---

## 🌐 КОНФИГУРАЦИЯ

### Backend (.env)
```env
PORT=3000
JWT_SECRET=a7f3e9c2b8d4f1a6e5c9b3d7f2a8e4c1b9d5f3a7e2c8b4d1f6a9e3c7b2d8f4a1
MONGO_URI=mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket
ONELYA_BASE_URL=https://api-test.onelya.ru/
ONELYA_LOGIN=trevel_test
ONELYA_PASSWORD=5mPaN5KyB!27LN!
ONELYA_POS=trevel_test
NODE_ENV=production
```

### Frontend (constants/api.js)
```javascript
export const API_BASE = 'http://193.233.103.8:3000/api';
```

---

## 🗄️ БАЗА ДАННЫХ

### MongoDB Atlas
- **URI**: `mongodb+srv://...@aviamarket.7o9kplj.mongodb.net/tickets`
- **База**: `tickets`
- **Коллекции**:
  - `users` - Пользователи (1 документ)
  - `bookings` - Бронирования (1 тестовое)
  - `faqs` - FAQ (15 документов)
  - `supportmessages` - Сообщения поддержки (0)

### Другие базы (не используются):
- `test` - Стандартная тестовая база MongoDB
- `sample_mfix` - Примеры данных MongoDB Atlas

---

## 🔐 ТЕСТОВЫЙ АККАУНТ

```
Email: test@test.com
Пароль: 123456
ID: 6930a7f7500ef1c618143a14
```

**Тестовое бронирование:**
- Маршрут: Москва (SVO) → Санкт-Петербург (LED)
- Рейс: SU 1234
- Дата: 15.12.2025
- Цена: 5000 RUB

---

## 🚀 ЗАПУСК

### Backend
```bash
cd tickets-backend
npm install
npm run start:dev      # Разработка
npm run build          # Сборка
npm run start:prod     # Production
```

### Frontend
```bash
cd aviatickets-demo
npm install
npx expo start         # Запуск Expo
npx expo start --ios   # iOS
npx expo start --android # Android
```

---

## 📡 API ENDPOINTS

Все роуты с префиксом `/api`:

### Авторизация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/google` - OAuth Google
- `POST /api/auth/apple` - OAuth Apple
- `GET /api/auth/me` - Получить текущего пользователя

### Пользователь
- `GET /api/me` - Получить профиль
- `PUT /api/me` - Обновить профиль
- `POST /api/me/avatar` - Загрузить аватар

### Бронирования
- `POST /api/booking/create` - Создать бронирование
- `GET /api/booking` - Список бронирований пользователя
- `GET /api/booking/:id` - Получить бронирование
- `GET /api/booking/:id/pdf` - Скачать PDF билет

### Рейсы
- `GET /api/flights/search` - Поиск рейсов
- `POST /api/flights/search` - Поиск рейсов (POST)
- `GET /api/flights/health` - Проверка работы

### Onelya API
- `POST /api/onelya/avia/search/route-pricing` - Поиск по маршруту
- `POST /api/onelya/order/reservation/create` - Создать резервацию
- `POST /api/onelya/order/reservation/confirm` - Подтвердить резервацию
- `GET /api/onelya/health` - Проверка доступности Onelya

### FAQ и Поддержка
- `GET /api/faq` - Список FAQ
- `GET /api/support/messages` - Сообщения поддержки
- `POST /api/support/messages` - Отправить сообщение

---

## 🔧 ВАЖНЫЕ ИЗМЕНЕНИЯ

### ✅ Исправлено в коде:
1. Добавлен `app.setGlobalPrefix('api')` в main.ts
2. API_BASE обновлен на `http://193.233.103.8:3000/api`
3. Все fetch() заменены на централизованную функцию api()
4. Авторизация исправлена (проверка токена при старте)
5. ProfileScreen показывает кнопки входа для неавторизованных
6. PassengerInfoScreen проверяет авторизацию перед бронированием

### ⚠️ Требуется на сервере Timeweb:
1. Обновить `src/main.ts` - добавить `app.setGlobalPrefix('api')`
2. Пересобрать: `npm run build`
3. Перезапустить: `pm2 restart aviatickets-backend`

---

## 📊 АРХИТЕКТУРА

```
┌─────────────────┐         HTTP/REST         ┌──────────────────┐
│   Expo App      │ ─────────────────────────> │  NestJS API      │
│   (Mobile)      │  /api/auth/login          │  (Timeweb)       │
│                 │  /api/booking/create       │  Port: 3000      │
└─────────────────┘                            └──────────────────┘
                                                       │
                                                       │ Mongoose
                                                       ▼
                                                ┌──────────────────┐
                                                │  MongoDB Atlas   │
                                                │  Database: tickets│
                                                └──────────────────┘
                                                       │
                                                       │ HTTP
                                                       ▼
                                                ┌──────────────────┐
                                                │  Onelya API      │
                                                │  (Test env)      │
                                                └──────────────────┘
```

---

## 🛠️ ТЕХНОЛОГИИ

### Frontend:
- React Native 0.76.5
- Expo SDK 52
- React Navigation 6.x
- AsyncStorage (хранение токена)
- Expo Image Picker
- Expo Google Fonts

### Backend:
- NestJS 10.x
- MongoDB + Mongoose
- JWT Authentication (@nestjs/jwt)
- Passport JWT Strategy
- Swagger UI (документация API)
- PDFKit (генерация билетов)
- bwip-js (штрихкоды)
- bcryptjs (хеширование паролей)

### DevOps:
- PM2 (процесс-менеджер)
- Docker (опционально)
- Timeweb Cloud (хостинг)

---

## 🧪 СКРИПТЫ ДИАГНОСТИКИ

```bash
# Полная диагностика системы
node scripts/full-diagnosis.js

# Тест сервера Timeweb
bash scripts/test-server.sh

# Проверка подключения к MongoDB
node scripts/check-connection.js

# Создать тестового пользователя
node scripts/seed-atlas-user.js

# Создать тестовое бронирование
node scripts/create-test-booking.js

# Тест JWT токенов
node scripts/test-jwt.js
```

---

## 🐛 ТЕКУЩИЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема 1: 404 на /api/me и /api/booking
**Причина**: На сервере Timeweb нет `app.setGlobalPrefix('api')` в main.ts  
**Решение**: См. `FIX_ROUTES.md`

### Проблема 2: Автоматический вход при запуске
**Причина**: Токен сохранен в AsyncStorage  
**Решение**: См. `CLEAR_APP_DATA.md`

### Проблема 3: Бронирования не сохраняются
**Причина**: 404 ошибки из-за отсутствия префикса /api  
**Решение**: После исправления main.ts все заработает

---

## 📋 ЧЕКЛИСТ РАЗВЕРТЫВАНИЯ

- [ ] Обновить main.ts на сервере (добавить app.setGlobalPrefix('api'))
- [ ] Проверить JWT_SECRET в .env (должен совпадать)
- [ ] Проверить MONGO_URI (должен указывать на tickets)
- [ ] Пересобрать backend: `npm run build`
- [ ] Перезапустить PM2: `pm2 restart aviatickets-backend`
- [ ] Очистить AsyncStorage в приложении
- [ ] Протестировать вход: test@test.com / 123456
- [ ] Протестировать редактирование профиля
- [ ] Протестировать создание бронирования
- [ ] Проверить отображение билетов

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Исправьте main.ts на сервере** (см. FIX_ROUTES.md)
2. **Очистите AsyncStorage** (см. CLEAR_APP_DATA.md)
3. **Протестируйте приложение**
4. **Проверьте сохранение данных в MongoDB**

После этого все функции будут работать! ✈️
