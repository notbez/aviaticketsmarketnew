# 📊 Анализ структуры проекта Aviatickets

## 🎯 Общая архитектура

Проект представляет собой **full-stack приложение** для бронирования авиабилетов:

```
┌─────────────────┐         HTTP/REST API        ┌──────────────────┐
│  React Native   │ ────────────────────────────> │   NestJS API     │
│  (Expo Mobile)  │  http://193.233.103.8:3000   │   (Backend)      │
│                 │ <──────────────────────────── │                  │
└─────────────────┘         JSON Response         └──────────────────┘
                                                            │
                                                            │ Mongoose ODM
                                                            ▼
                                                   ┌──────────────────┐
                                                   │  MongoDB Atlas   │
                                                   │  (Cloud DB)      │
                                                   └──────────────────┘
                                                            │
                                                            │ HTTP API
                                                            ▼
                                                   ┌──────────────────┐
                                                   │   Onelya API     │
                                                   │ (Поиск рейсов)   │
                                                   └──────────────────┘
```

---

## 📱 Frontend: React Native (Expo)

### Технологический стек

| Технология | Версия | Назначение |
|-----------|--------|------------|
| React | 19.1.0 | UI библиотека |
| React Native | 0.81.5 | Мобильная платформа |
| Expo | ~54.0.23 | Инструментарий разработки |
| React Navigation | ^7.x | Навигация между экранами |
| AsyncStorage | ^2.2.0 | Локальное хранилище |
| Expo Image Picker | ^17.0.8 | Загрузка аватаров |

### Структура директорий

```
aviatickets-demo/
│
├── screens/                    # 21 экран приложения
│   ├── HomeScreen.js           # Главная страница
│   ├── LoginScreen.js          # Авторизация
│   ├── SignUpScreen.js         # Регистрация
│   ├── SearchScreen.js         # Поиск рейсов
│   ├── ResultsScreen.js        # Результаты поиска
│   ├── BookingScreen.js        # Бронирование
│   ├── TicketsScreen.js        # Мои билеты
│   ├── ProfileScreen.js        # Профиль пользователя
│   ├── AccountScreen.js        # Редактирование профиля
│   ├── PaymentScreen.js        # Оплата
│   ├── SupportScreen.js        # Чат поддержки
│   └── ...                     # Другие экраны
│
├── navigation/                 # Навигация
│   ├── RootNavigation.js       # Корневая навигация (Stack)
│   └── BottomTabs.js           # Нижние вкладки (Home, Tickets, Profile)
│
├── contexts/                   # React Context API
│   └── AuthContext.js          # Управление авторизацией
│
├── lib/                        # Утилиты
│   └── api.js                  # Централизованный HTTP клиент
│
├── constants/                  # Константы
│   ├── api.js                  # API_BASE URL конфигурация
│   └── airports.js             # Список аэропортов
│
├── components/                 # Переиспользуемые компоненты
│   ├── FlightCard.js           # Карточка рейса
│   ├── Input.js                # Поле ввода
│   ├── LoadingOverlay.js       # Индикатор загрузки
│   └── PrimaryButton.js        # Кнопка
│
├── assets/                     # Статические ресурсы
│   ├── icons/                  # Иконки навигации
│   ├── icon.png                # Иконка приложения
│   ├── splash-icon.png         # Splash screen
│   └── avatar-placeholder.png  # Аватар по умолчанию
│
└── App.js                      # Точка входа приложения
```

### Ключевые компоненты

#### 1. **App.js** - Точка входа
```javascript
- Загрузка шрифтов Roboto (400, 500, 700)
- Инициализация AuthProvider
- Настройка NavigationContainer
- Отображение SplashScreen при загрузке
```

#### 2. **AuthContext.js** - Управление авторизацией
```javascript
Функции:
- login(accessToken, userData)      // Вход в систему
- register(registerDto)             // Регистрация
- logout()                          // Выход
- updateUser(newData)               // Обновление профиля

Состояние:
- user: объект пользователя
- token: JWT токен
- loading: статус загрузки

Хранилище: AsyncStorage
- authToken: JWT токен
- user: JSON объект пользователя
```

#### 3. **api.js** - HTTP клиент
```javascript
Функция: api(endpoint, options)

Возможности:
✅ Автоматическое добавление Authorization header
✅ Обработка JSON/text ответов
✅ Автоматическая очистка токена при 401
✅ Обработка сетевых ошибок
✅ Умное объединение URL (joinUrl)

Пример использования:
const data = await api('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

#### 4. **RootNavigation.js** - Навигация
```javascript
Структура:
- Stack Navigator (корневой)
  ├── Login (если не авторизован)
  ├── SignUp
  └── MainTabs (если авторизован)
      ├── Home
      ├── Tickets
      └── Profile
```

### API конфигурация

```javascript
// constants/api.js
export const API_BASE = 'http://193.233.103.8:3000/api';

Приоритет загрузки:
1. process.env.EXPO_PUBLIC_API_BASE
2. Constants.expoConfig.extra.apiBase
3. Fallback: 'http://193.233.103.8:3000/api'
```

---

## 🖥️ Backend: NestJS

### Технологический стек

| Технология | Версия | Назначение |
|-----------|--------|------------|
| NestJS | ^10.0.0 | Backend framework |
| MongoDB | ^8.19.3 | База данных (Mongoose) |
| JWT | ^11.0.1 | Аутентификация |
| Passport | ^0.7.0 | Стратегии авторизации |
| Swagger | ^7.4.2 | API документация |
| PDFKit | ^0.17.2 | Генерация PDF билетов |
| Axios | ^1.13.2 | HTTP клиент для Onelya API |
| bcrypt | ^6.0.0 | Хеширование паролей |

### Структура модулей

```
tickets-backend/src/
│
├── main.ts                     # Точка входа (app.setGlobalPrefix('api'))
├── app.module.ts               # Корневой модуль
│
├── auth/                       # 🔐 Авторизация
│   ├── auth.controller.ts      # POST /api/auth/login, /register
│   ├── auth.service.ts         # Логика авторизации
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── oauth.dto.ts        # Google/Apple OAuth
│   └── guards/
│       └── jwt-auth.guard.ts   # JWT защита роутов
│
├── users/                      # 👤 Пользователи
│   ├── users.controller.ts     # GET/PUT /api/me
│   ├── users.service.ts        # Управление пользователями
│   ├── users.module.ts
│   └── dto/
│       └── update-user.dto.ts
│
├── booking/                    # 🎫 Бронирования
│   ├── booking.controller.ts   # POST /api/booking/create
│   ├── booking.service.ts      # GET /api/booking, /api/booking/:id
│   └── booking.module.ts       # GET /api/booking/:id/pdf
│
├── flights/                    # ✈️ Рейсы
│   ├── flights.controller.ts   # POST /api/flights/search
│   ├── flights.service.ts      # Интеграция с Onelya API
│   ├── flights.module.ts
│   └── direct-search.controller.ts
│
├── onelya/                     # 🔌 Onelya API интеграция
│   ├── onelya.controller.ts
│   ├── onelya.service.ts       # HTTP клиент для Onelya
│   ├── onelya.health.controller.ts
│   ├── onelya.module.ts
│   ├── dto/                    # DTO для Onelya запросов
│   └── interceptors/
│
├── faq/                        # ❓ FAQ
│   ├── faq.controller.ts       # GET /api/faq
│   ├── faq.service.ts
│   ├── faq.module.ts
│   └── faq-seed.service.ts     # Заполнение базы
│
├── support/                    # 💬 Поддержка
│   ├── support.controller.ts   # GET/POST /api/support/messages
│   ├── support.service.ts
│   └── support.module.ts
│
├── schemas/                    # 📄 MongoDB схемы
│   ├── user.schema.ts          # Пользователи
│   ├── booking.schema.ts       # Бронирования
│   ├── faq.schema.ts           # FAQ
│   └── support-message.schema.ts
│
└── providers/                  # 🔧 Провайдеры
    ├── onelya.provider.ts
    └── provider.interface.ts
```

### Ключевые файлы

#### 1. **main.ts** - Точка входа
```typescript
Конфигурация:
✅ app.setGlobalPrefix('api')           // Все роуты с префиксом /api
✅ ValidationPipe (глобальная валидация)
✅ Swagger UI на /api
✅ Порт: process.env.PORT || 3000

Запуск: http://localhost:3000/api
```

#### 2. **app.module.ts** - Корневой модуль
```typescript
Импорты:
- ConfigModule.forRoot()                // Загрузка .env
- MongooseModule.forRoot()              // Подключение к MongoDB
- HttpModule.register()                 // HTTP клиент (timeout: 15s)
- FlightsModule, BookingModule, AuthModule, UsersModule
- FaqModule, SupportModule, OnelyaModule
```

#### 3. **auth.service.ts** - Авторизация
```typescript
Методы:
- register(dto): создание пользователя + JWT
- login(dto): проверка пароля + JWT
- googleAuth(dto): OAuth Google
- appleAuth(dto): OAuth Apple
- validateUser(email, password): проверка учетных данных

JWT Payload: { sub: userId, email }
```

#### 4. **booking.service.ts** - Бронирования
```typescript
Методы:
- create(userId, bookingData): создание бронирования
- getUserBookings(userId): список бронирований
- getById(id): получение бронирования
- generatePDF(id): генерация PDF билета (PDFKit)

PDF содержит:
- Маршрут (FROM → TO)
- Пассажир, рейс, дата
- Время вылета/прилета
- Место, выход, посадка
- Штрихкод (code128)
```

### API Endpoints

#### Авторизация
```
POST   /api/auth/register       # Регистрация
POST   /api/auth/login          # Вход
POST   /api/auth/google         # Google OAuth
POST   /api/auth/apple          # Apple OAuth
```

#### Пользователи
```
GET    /api/me                  # Получить профиль (JWT)
PUT    /api/me                  # Обновить профиль (JWT)
POST   /api/me/avatar           # Загрузить аватар (JWT)
```

#### Бронирования
```
POST   /api/booking/create      # Создать бронирование (JWT)
GET    /api/booking             # Список бронирований (JWT)
GET    /api/booking/:id         # Получить бронирование (JWT)
GET    /api/booking/:id/pdf     # Скачать PDF билет (JWT)
```

#### Рейсы
```
POST   /api/flights/search      # Поиск рейсов
GET    /api/flights/direct      # Прямые рейсы
```

#### Другие
```
GET    /api/faq                 # FAQ
GET    /api/support/messages    # Сообщения поддержки (JWT)
POST   /api/support/messages    # Отправить сообщение (JWT)
GET    /api/onelya/health       # Health check Onelya API
```

---

## 🗄️ База данных: MongoDB Atlas

### Конфигурация

```env
MONGO_URI=mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket

База: tickets
Хост: aviamarket.7o9kplj.mongodb.net
```

### Коллекции

#### 1. **users** - Пользователи
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  firstName: String,
  lastName: String,
  phone: String,
  avatar: String (base64),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **bookings** - Бронирования
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  from: String,                    // Код аэропорта отправления
  to: String,                      // Код аэропорта прибытия
  departureDate: Date,
  flightNumber: String,
  departTime: String,
  arriveTime: String,
  passengers: [{
    fullName: String,
    passportNumber: String,
    dateOfBirth: Date
  }],
  seat: String,                    // Место (12A)
  gate: String,                    // Выход (B5)
  boardingTime: String,            // Время посадки
  payment: {
    amount: Number,
    currency: String
  },
  providerBookingId: String,       // ID от Onelya
  status: String,                  // confirmed, cancelled
  createdAt: Date
}
```

#### 3. **faqs** - FAQ
```javascript
{
  _id: ObjectId,
  question: String,
  answer: String,
  category: String,
  order: Number
}
```

#### 4. **supportmessages** - Сообщения поддержки
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  message: String,
  response: String,
  status: String,                  // pending, answered
  createdAt: Date
}
```

### Тестовый аккаунт

```
Email: test@test.com
Пароль: 123456
ID: 6930a7f7500ef1c618143a14
```

---

## 🔌 Внешние интеграции

### Onelya API

```env
ONELYA_BASE_URL=https://api-test.onelya.ru/
ONELYA_LOGIN=trevel_test
ONELYA_PASSWORD=5mPaN5KyB!27LN!
ONELYA_POS=trevel_test
```

**Назначение:** Поиск реальных авиарейсов

**Endpoints:**
- POST /api/v1/search - Поиск рейсов
- GET /api/v1/health - Health check

---

## 🔐 Безопасность

### JWT Authentication

```typescript
Стратегия: passport-jwt
Secret: JWT_SECRET (из .env)
Payload: { sub: userId, email }
Header: Authorization: Bearer <token>

Защищенные роуты:
- /api/me (GET, PUT)
- /api/booking/* (все)
- /api/support/messages (GET, POST)
```

### Валидация

```typescript
- class-validator для DTO
- ValidationPipe (глобальный)
- whitelist: true (удаление лишних полей)
- forbidNonWhitelisted: true (ошибка при лишних полях)
```

### Хеширование паролей

```typescript
Библиотека: bcrypt
Раунды: 10
Метод: bcrypt.hash(password, 10)
```

---

## 🚀 Развертывание

### Backend (Timeweb)

```bash
Сервер: http://193.233.103.8:3000
Порт: 3000
Префикс: /api

Запуск:
npm run build
npm run start:prod

PM2:
pm2 start ecosystem.config.js
pm2 logs tickets-backend
```

### Frontend (Expo)

```bash
Разработка:
npx expo start

Сборка:
npx expo build:android
npx expo build:ios

EAS Build:
eas build --platform android
```

---

## 📊 Метрики проекта

### Frontend
- **Экраны:** 21
- **Компоненты:** 4
- **Контексты:** 1 (AuthContext)
- **Зависимости:** 25+

### Backend
- **Модули:** 7 (Auth, Users, Booking, Flights, FAQ, Support, Onelya)
- **Контроллеры:** 10+
- **Сервисы:** 10+
- **Схемы:** 4
- **Endpoints:** 15+

### База данных
- **Коллекции:** 4
- **Индексы:** email (unique) в users

---

## 🔧 Скрипты

### Backend
```bash
npm run start:dev          # Разработка (watch mode)
npm run start:prod         # Продакшн
npm run build              # Сборка TypeScript
npm run lint               # ESLint
npm run test               # Jest тесты
```

### Frontend
```bash
npm start                  # Expo dev server
npm run android            # Android эмулятор
npm run ios                # iOS симулятор
npm run web                # Web версия
```

---

## ⚠️ Известные проблемы

### ✅ Исправлено
1. ✅ Добавлен `app.setGlobalPrefix('api')` в main.ts
2. ✅ API_BASE обновлен на `http://193.233.103.8:3000/api`
3. ✅ Все fetch заменены на централизованную функцию api()
4. ✅ Авторизация исправлена (показывает Login при старте)

### 🔄 Требуется внимание
1. ⚠️ Обновить main.ts на сервере Timeweb
2. ⚠️ Настроить CORS для продакшн домена
3. ⚠️ Добавить rate limiting для API
4. ⚠️ Настроить логирование (Winston/Pino)

---

## 📈 Рекомендации по улучшению

### Backend
1. **Кеширование:** Redis для частых запросов
2. **Логирование:** Winston + файлы логов
3. **Мониторинг:** PM2 + Sentry
4. **Тесты:** Unit тесты для сервисов (Jest)
5. **Документация:** Swagger аннотации для всех endpoints

### Frontend
1. **Состояние:** Redux/Zustand вместо Context API
2. **Кеширование:** React Query для API запросов
3. **Оптимизация:** React.memo, useMemo, useCallback
4. **Тесты:** Jest + React Native Testing Library
5. **Типизация:** TypeScript вместо JavaScript

### DevOps
1. **CI/CD:** GitHub Actions для автодеплоя
2. **Docker:** Контейнеризация backend
3. **Nginx:** Reverse proxy + SSL
4. **Backup:** Автоматический backup MongoDB
5. **Мониторинг:** Grafana + Prometheus

---

## 📝 Заключение

Проект представляет собой **полнофункциональное мобильное приложение** для бронирования авиабилетов с:

✅ **Современным стеком:** React Native + NestJS + MongoDB  
✅ **JWT авторизацией:** Безопасная аутентификация  
✅ **REST API:** Четкая структура endpoints  
✅ **PDF генерацией:** Автоматическое создание билетов  
✅ **Внешними интеграциями:** Onelya API для поиска рейсов  
✅ **Документацией:** Swagger UI для API  

**Архитектура:** Модульная, масштабируемая, следует best practices NestJS и React Native.

**Готовность:** Проект готов к развертыванию и дальнейшему развитию.
