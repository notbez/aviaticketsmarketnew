# ✈️ Aviatickets - Приложение для бронирования авиабилетов

## 📁 Структура проекта

```
aviaticketsmarketnew/
│
├── 📱 aviatickets-demo/                    # React Native приложение (Expo)
│   ├── screens/                            # Экраны
│   │   ├── HomeScreen.js                   # Главный экран
│   │   ├── LoginScreen.js                  # Вход
│   │   ├── SignUpScreen.js                 # Регистрация
│   │   ├── BookingScreen.js                # Бронирование
│   │   ├── TicketsScreen.js                # Мои билеты
│   │   ├── ProfileScreen.js                # Профиль
│   │   ├── AccountScreen.js                # Редактирование профиля
│   │   └── ...                             # Другие экраны
│   │
│   ├── navigation/                         # Навигация
│   │   ├── RootNavigation.js               # Корневая навигация
│   │   └── BottomTabs.js                   # Нижние вкладки
│   │
│   ├── contexts/                           # React Context
│   │   └── AuthContext.js                  # Авторизация
│   │
│   ├── lib/                                # Утилиты
│   │   └── api.js                          # API клиент
│   │
│   ├── constants/                          # Константы
│   │   └── api.js                          # API_BASE URL
│   │
│   ├── components/                         # Компоненты
│   ├── App.js                              # Точка входа
│   └── package.json
│
├── 🖥️ tickets-backend/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/                           # Авторизация
│   │   │   ├── auth.controller.ts          # POST /api/auth/login, /api/auth/register
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   │
│   │   ├── users/                          # Пользователи
│   │   │   ├── users.controller.ts         # GET/PUT /api/me
│   │   │   └── users.service.ts
│   │   │
│   │   ├── booking/                        # Бронирования
│   │   │   ├── booking.controller.ts       # POST /api/booking/create, GET /api/booking
│   │   │   └── booking.service.ts
│   │   │
│   │   ├── flights/                        # Рейсы
│   │   ├── onelya/                         # Onelya API
│   │   ├── faq/                            # FAQ
│   │   ├── support/                        # Поддержка
│   │   │
│   │   ├── schemas/                        # MongoDB схемы
│   │   │   ├── user.schema.ts
│   │   │   ├── booking.schema.ts
│   │   │   └── ...
│   │   │
│   │   ├── main.ts                         # Точка входа (app.setGlobalPrefix('api'))
│   │   └── app.module.ts
│   │
│   ├── scripts/                            # Утилиты
│   │   ├── seed-atlas-user.js              # Создание тестового пользователя
│   │   ├── full-diagnosis.js               # Диагностика
│   │   └── test-server.sh                  # Тест API
│   │
│   ├── .env                                # Переменные окружения
│   └── package.json
│
└── 📚 Документация/
    ├── README.md                           # Этот файл
    ├── PROJECT_STRUCTURE.md                # Подробная структура
    ├── FIX_ROUTES.md                       # Исправление роутов
    ├── COMPLETE_SOLUTION.md                # Полное решение
    └── ...
```

## 🔑 Ключевые файлы

### Backend
- `tickets-backend/src/main.ts` - **app.setGlobalPrefix('api')** ⚠️ ВАЖНО!
- `tickets-backend/.env` - JWT_SECRET, MONGO_URI
- `tickets-backend/src/auth/auth.service.ts` - Логика авторизации

### Frontend
- `aviatickets-demo/constants/api.js` - **API_BASE = 'http://193.233.103.8:3000/api'**
- `aviatickets-demo/lib/api.js` - Централизованный API клиент
- `aviatickets-demo/contexts/AuthContext.js` - Управление авторизацией

## 🌐 Конфигурация

### Backend (tickets-backend/.env)
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

### Frontend (aviatickets-demo/constants/api.js)
```javascript
export const API_BASE = 'http://193.233.103.8:3000/api';
```

## 🗄️ База данных

**MongoDB Atlas:**
- URI: `mongodb+srv://...@aviamarket.7o9kplj.mongodb.net/tickets`
- База: `tickets`
- Коллекции: `users`, `bookings`, `faqs`, `supportmessages`

## 🔐 Тестовый аккаунт

```
Email: test@test.com
Пароль: 123456
ID: 6930a7f7500ef1c618143a14
```

## 🚀 Запуск

### Backend
```bash
cd tickets-backend
npm install
npm run start:dev
```

### Frontend
```bash
cd aviatickets-demo
npm install
npx expo start
```

## 📡 API Endpoints

Все роуты с префиксом `/api`:

### Авторизация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация

### Пользователь
- `GET /api/me` - Получить профиль
- `PUT /api/me` - Обновить профиль

### Бронирования
- `POST /api/booking/create` - Создать бронирование
- `GET /api/booking` - Список бронирований
- `GET /api/booking/:id` - Получить бронирование
- `GET /api/booking/:id/pdf` - Скачать PDF билет

### Другие
- `GET /api/faq` - FAQ
- `GET /api/support/messages` - Сообщения поддержки
- `POST /api/support/messages` - Отправить сообщение

## 🔧 Важные изменения

### ✅ Исправлено
1. Добавлен `app.setGlobalPrefix('api')` в main.ts
2. API_BASE обновлен на `http://193.233.103.8:3000/api`
3. Все fetch заменены на централизованную функцию api()
4. Авторизация исправлена (показывает Login при старте)

### ⚠️ Требуется на сервере
Обновить `main.ts` на сервере Timeweb (см. FIX_ROUTES.md)

## 📊 Архитектура

```
┌─────────────┐         HTTP          ┌──────────────┐
│   Expo App  │ ───────────────────> │ NestJS API   │
│  (Mobile)   │  /api/auth/login     │ (Timeweb)    │
└─────────────┘                       └──────────────┘
                                             │
                                             │ Mongoose
                                             ▼
                                      ┌──────────────┐
                                      │ MongoDB      │
                                      │ Atlas        │
                                      └──────────────┘
```

## 🛠️ Технологии

**Frontend:**
- React Native (Expo)
- React Navigation
- AsyncStorage
- Expo Image Picker

**Backend:**
- NestJS
- MongoDB (Mongoose)
- JWT Authentication
- Swagger UI
- PDFKit (генерация билетов)

**Внешние API:**
- Onelya API (поиск рейсов)
