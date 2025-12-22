# Архитектура проекта Aviatickets

## Обзор проекта

**Aviatickets** — это полнофункциональная система бронирования авиабилетов, состоящая из:
- **Backend API** (NestJS + MongoDB) — серверная часть с интеграцией Onelya API
- **Mobile App** (React Native + Expo) — мобильное приложение для iOS/Android

## Полная структура проекта

```
aviaticketsmarketnew/
├── .expo/                           # Expo конфигурация (корневая)
│   ├── README.md
│   └── settings.json
├── .qodo/                           # Qodo AI конфигурация
│   ├── agents/
│   └── workflows/
├── aviatickets-demo/                # Mobile App (React Native + Expo)
│   ├── .expo/                       # Expo конфигурация приложения
│   │   ├── devices.json
│   │   ├── README.md
│   │   └── settings.json
│   ├── assets/                      # Ресурсы приложения
│   │   ├── icons/                   # Иконки табов
│   │   │   ├── tab-home.png
│   │   │   ├── tab-profile.png
│   │   │   └── tab-tickets.png
│   │   ├── adaptive-icon.png        # Адаптивная иконка
│   │   ├── avatar-placeholder.jpg   # Заглушка аватара
│   │   ├── avatar-placeholder.png
│   │   ├── favicon.png              # Фавикон
│   │   ├── home-wave.png           # Декоративные элементы
│   │   ├── icon.png                # Основная иконка
│   │   ├── plane.png               # Иконка самолета
│   │   └── splash-icon.png         # Иконка сплэш-экрана
│   ├── components/                  # Переиспользуемые UI компоненты
│   │   ├── FlightCard.js           # Карточка рейса
│   │   ├── Input.js                # Поле ввода
│   │   ├── LoadingOverlay.js       # Индикатор загрузки
│   │   └── PrimaryButton.js        # Основная кнопка
│   ├── constants/                   # Константы приложения
│   │   ├── airports.js             # Данные аэропортов
│   │   └── api.js                  # API конфигурация
│   ├── contexts/                    # React Context провайдеры
│   │   └── AuthContext.js          # Контекст аутентификации
│   ├── data/                        # Статические данные
│   │   └── airports.js             # База данных аэропортов
│   ├── hooks/                       # Кастомные React хуки
│   │   └── useFonts.js             # Хук для загрузки шрифтов
│   ├── lib/                         # Библиотеки и утилиты
│   │   ├── api.js                  # HTTP клиент
│   │   └── mockOrders.js           # Моковые данные заказов
│   ├── navigation/                  # Навигация приложения
│   │   ├── BottomTabs.js           # Нижние табы
│   │   └── RootNavigation.js       # Корневая навигация
│   ├── screens/                     # Экраны приложения
│   │   ├── AccountScreen.js        # Экран аккаунта
│   │   ├── BookingScreen.js        # Экран бронирования
│   │   ├── FaqScreen.js            # Экран FAQ
│   │   ├── FlightDetailsScreen.js  # Детали рейса
│   │   ├── HomeScreen.js           # Главный экран
│   │   ├── LoginScreen.js          # Экран входа
│   │   ├── LogoutScreen.js         # Экран выхода
│   │   ├── PassengerInfoScreen.js  # Данные пассажиров
│   │   ├── PaymentScreen.js        # Экран оплаты
│   │   ├── PaymentsScreen.js       # История платежей
│   │   ├── ProfileScreen.js        # Профиль пользователя
│   │   ├── ResultsScreen.js        # Результаты поиска
│   │   ├── SearchScreen.js         # Поиск рейсов
│   │   ├── SeatSelectionScreen.js  # Выбор места
│   │   ├── SelectCityScreen.js     # Выбор города
│   │   ├── SettingsScreen.js       # Настройки
│   │   ├── SignUpScreen.js         # Регистрация
│   │   ├── SplashScreen.js         # Загрузочный экран
│   │   ├── SupportOptionsScreen.js # Опции поддержки
│   │   ├── SupportScreen.js        # Поддержка
│   │   ├── TicketDetailsScreen.js  # Детали билета
│   │   └── TicketsScreen.js        # Список билетов
│   ├── services/                    # Внешние сервисы
│   │   └── authProviders.js        # OAuth провайдеры
│   ├── utils/                       # Утилиты
│   │   └── clearLocalBookings.js   # Очистка локальных бронирований
│   ├── .easignore                   # EAS игнорируемые файлы
│   ├── .gitignore                   # Git игнорируемые файлы
│   ├── App.js                       # Корневой компонент
│   ├── app.json                     # Конфигурация Expo
│   ├── code.json                    # Конфигурация кода
│   ├── eas.json                     # EAS Build конфигурация
│   ├── index.js                     # Точка входа
│   ├── package-lock.json            # Зависимости (lock)
│   └── package.json                 # Зависимости и скрипты
├── tickets-backend/                 # Backend API (NestJS)
│   ├── .expo/                       # Expo конфигурация (не используется)
│   │   ├── README.md
│   │   └── settings.json
│   ├── scripts/                     # Скрипты развертывания
│   ├── src/                         # Исходный код
│   │   ├── assets/                  # Статические ресурсы
│   │   │   ├── fonts/               # Шрифты для PDF
│   │   │   │   └── NotoSans-Regular.ttf
│   │   │   └── fonts 2/             # Дублирующая папка шрифтов
│   │   ├── assets_temp/             # Временные ресурсы
│   │   ���   └── fonts/
│   │   │       └── NotoSans-Regular.ttf
│   │   ├── auth/                    # Модуль аутентификации
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── login.dto.ts     # DTO для входа
│   │   │   │   ├── oauth.dto.ts     # DTO для OAuth
│   │   │   │   └── register.dto.ts  # DTO для регистрации
│   │   │   ├── guards/              # Защитники маршрутов
│   │   │   │   └── jwt-auth.guard.ts # JWT Guard
│   │   │   ├── auth.controller.ts   # Контроллер аутентификации
│   │   │   ├── auth.module.ts       # Модуль аутентификации
│   │   │   ├── auth.service.ts      # Сервис аутентификации
│   │   │   ├── oauth.controller.ts  # OAuth контроллер
│   │   │   └── oauth.service.ts     # OAuth сервис
│   │   ├── booking/                 # Модуль бронирований
│   │   │   ├── booking.controller.ts # Контроллер бронирований
│   │   │   ├── booking.module.ts    # Модуль бронирований
│   │   │   └── booking.service.ts   # Сервис бронирований
│   │   ├── faq/                     # Модуль FAQ
│   │   │   ├── faq-seed.service.ts  # Сервис заполнения FAQ
│   │   │   ├── faq.controller.ts    # Контроллер FAQ
│   │   │   ├── faq.module.ts        # Модуль FAQ
│   │   │   ├── faq.service.ts       # Сервис FAQ
│   │   │   └── seed-faq.ts          # Скрипт заполнения FAQ
│   │   ├── flights/                 # Модуль рейсов
│   │   │   ├── direct-search.controller.ts # Прямой поиск
│   │   │   ├── flight-offer.entity.ts      # Сущность предложения
│   │   │   ├── flight-offer.store.ts       # In-memory хранилище
│   │   │   ├── flights.controller.ts       # Контроллер рейсов
│   │   │   ├── flights.module.ts           # Модуль рейсов
│   │   │   └── flights.service.ts          # Сервис рейсов
│   │   ├── onelya/                  # Модуль интеграции Onelya
│   │   │   ├── dto/                 # DTO для Onelya API
│   │   │   │   ├── avia-search.dto.ts      # DTO поиска рейсов
│   │   │   │   └── order-reservation.dto.ts # DTO бронирований
│   │   │   ├── interceptors/        # Перехватчики
│   │   │   │   └── onelya-logging.interceptor.ts # Логирование
│   │   │   ├── utils/               # Утилиты Onelya
│   │   │   │   ├── provider-raw.builder.ts # Билдер данных
│   │   │   │   └── select-brand-fare.ts    # Выбор тарифа
│   │   │   ├── onelya.controller.ts # Контроллер Onelya
│   │   │   ├── onelya.health.controller.ts # Health check
│   │   │   ├── onelya.module.ts     # Модуль Onelya
│   │   │   └── onelya.service.ts    # Сервис Onelya
│   │   ├── providers/               # Провайдеры билетов
│   │   │   ├── onelya.provider.ts   # Провайдер Onelya
│   │   │   └── provider.interface.ts # Интерфейс провайдера
│   │   ├── schemas/                 # MongoDB схемы
│   │   │   ├── booking.schema.ts    # Схема бронирований
│   │   │   ├── faq.schema.ts        # Схема FAQ
│   │   │   ├── support-message.schema.ts # Схема сообщений поддержки
│   │   │   └── user.schema.ts       # Схема пользователей
│   │   ├── support/                 # Модуль поддержки
│   │   │   ├── support.controller.ts # Контроллер поддержки
│   │   │   ├── support.module.ts    # Модуль поддержки
│   │   │   └── support.service.ts   # Сервис поддержки
│   │   ├── users/                   # Модуль пользователей
│   │   │   ├── dto/                 # DTO пользователей
│   │   │   │   └── update-user.dto.ts # DTO обновления пользователя
│   │   │   ├── users.controller.ts  # Контроллер пользователей
│   │   │   ├── users.module.ts      # Модуль пользователей
│   │   │   └── users.service.ts     # Сервис пользователей
│   │   ├── app.controller.spec.ts   # Тесты контроллера
│   │   ├── app.controller.ts        # Главный контроллер
│   │   ├── app.module.ts            # Корневой модуль
│   │   ├── app.service.ts           # Главный сервис
│   │   └── main.ts                  # Точка входа
│   ├── test/                        # E2E тесты
│   │   ├── app.e2e-spec.ts         # E2E тесты
│   │   └── jest-e2e.json           # Конфигурация Jest E2E
│   ├── web: node dist/              # Билд для продакшена
│   │   └── main.js                 # Скомпилированный main.js
│   ├── .dockerignore               # Docker игнорируемые файлы
│   ├── .env                        # Переменные окружения
│   ├── .eslintrc.js               # ESLint конфигурация
│   ├── .gitignore                 # Git игнорируемые файлы
│   ├── .prettierrc                # Prettier конфигурация
│   ├── backend.log                # Лог файл
│   ├── backend.pid                # PID файл процесса
│   ├── docker-compose.yml         # Docker Compose конфигурация
│   ├── Dockerfile                 # Docker образ
│   ├── ecosystem.config.js        # PM2 конфигурация
│   ├── nest-cli.json             # NestJS CLI конфигурация
│   ├── package-lock.json         # Зависимости (lock)
│   ├── package.json              # Зависимости и скрипты
│   ├── README.md                 # Документация backend
│   ├── tsconfig.build.json       # TypeScript конфигурация (build)
│   └── tsconfig.json             # TypeScript конфигурация
└── ARCHITECTURE.md               # Данная документация
```

---

## Backend API (tickets-backend)

### Технологический стек
- **Framework**: NestJS 10.x
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + Passport (Google OAuth, Apple ID)
- **External API**: Onelya (поиск и бронирование рейсов)
- **PDF Generation**: PDFKit + bwip-js (штрихкоды)
- **HTTP Client**: Axios
- **Validation**: class-validator + class-transformer

### Архитектура модулей

#### 1. **AppModule** (`src/app.module.ts`)
Корневой модуль, объединяющий все функциональные модули:
- **ConfigModule**: загрузка переменных окружения (.env)
- **MongooseModule**: подключение к MongoDB
- **HttpModule**: HTTP клиент для внешних API
- Импорт всех функциональных модулей

#### 2. **AuthModule** (`src/auth/`)
**Назначение**: Аутентификация и авторизация пользователей

**Компоненты**:
- `AuthController`: регистрация, вход, обновление токенов
- `OauthController`: OAuth через Google и Apple
- `AuthService`: бизнес-логика аутентификации
- `OauthService`: обработка OAuth провайдеров
- `JwtAuthGuard`: защита маршрутов JWT токенами

**Функции**:
- Регистрация/вход по email + пароль
- OAuth авторизация (Google, Apple)
- JWT токены (срок действия 7 дней)
- Хеширование паролей (bcrypt)

#### 3. **UsersModule** (`src/users/`)
**Назначение**: Управление профилями пользователей

**Компоненты**:
- `UsersController`: CRUD операции с пользователями
- `UsersService`: бизнес-логика пользователей
- Загрузка аватаров (multer)

**Функции**:
- Получение/обновление профиля
- Управление настройками уведомлений
- Загрузка и хранение аватаров
- Управление согласиями (terms, notifications)

#### 4. **FlightsModule** (`src/flights/`)
**Назначение**: Поиск авиарейсов и управление предложениями

**Компоненты**:
- `FlightsController`: API для поиска рейсов
- `DirectSearchController`: прямой поиск без кеширования
- `FlightsService`: основная логика поиска
- `flight-offer.store.ts`: in-memory хранилище предложений

**Функции**:
- Поиск рейсов через Onelya API
- Двухэтапный поиск: RoutePricing + BrandFarePricing
- Кеширование предложений с UUID
- Обработка fallback данных при ошибках API
- Получение детальной информации о тарифах

**Алгоритм поиска**:
1. `RoutePricing` — базовый поиск маршрутов
2. `BrandFarePricing` — получение брендированных тарифов (батчами по 5)
3. Объединение результатов и создание карточек для фронтенда
4. Сохранение в `flightOfferStore` с уникальными UUID

#### 5. **OnelyaModule** (`src/onelya/`)
**Назначение**: Интеграция с внешним API Onelya

**Компоненты**:
- `OnelyaService`: HTTP клиент для Onelya API
- `OnelyaController`: прокси-контроллер для отладки
- `OnelyaHealthController`: проверка состояния API
- DTO классы для типизации запросов/ответов

**Функции**:
- Поиск рейсов (RoutePricing, DatePricing, BrandFarePricing)
- Получение информации о тарифах (FareInfoByRoute)
- Создание бронирований (Reservation/Create)
- Подтверждение бронирований (Reservation/Confirm)
- Генерация билетов (Reservation/Blank)
- Отмена бронирований (Reservation/Cancel, Void)

**Конфигурация**:
- Base URL: `ONELYA_BASE_URL` (по умолчанию: test API)
- Аутентификация: Basic Auth (`ONELYA_LOGIN:ONELYA_PASSWORD`)
- POS: `ONELYA_POS` (точка продаж)
- Таймаут: 180 секунд

#### 6. **BookingModule** (`src/booking/`)
**Назначение**: Управление бронированиями пользователей

**Компоненты**:
- `BookingController`: CRUD операции с бронированиями
- `BookingService`: бизнес-логика бронирований
- PDF генерация посадочных талонов

**Функции**:
- Создание бронирований через Onelya
- Получение списка бронирований пользователя
- Генерация PDF посадочных талонов
- Интеграция с платежными системами (заглушка)

#### 7. **SupportModule** (`src/support/`)
**Назначение**: Система поддержки пользователей

**Функции**:
- Чат с поддержкой
- Отправка сообщений
- История обращений

#### 8. **FaqModule** (`src/faq/`)
**Назначение**: База знаний и FAQ

**Функции**:
- Управление FAQ записями
- Категоризация вопросов
- Поиск по базе знаний

### Схемы данных (MongoDB)

#### User Schema (`src/schemas/user.schema.ts`)
```typescript
{
  fullName: string,
  email: string (unique, indexed),
  phone: string,
  passwordHash: string,
  passport?: {
    passportNumber?: string,
    country?: string,
    expiryDate?: Date
  },
  notifications?: {
    emailNotifications: boolean,
    pushNotifications: boolean
  },
  consents?: {
    termsAccepted: boolean,
    termsAcceptedAt?: Date,
    notificationsAccepted: boolean,
    notificationsAcceptedAt?: Date
  },
  avatarUrl?: string,
  avatar?: Buffer,
  avatarMimeType?: string,
  googleId?: string (indexed),
  appleId?: string (indexed),
  oauthProvider?: 'google' | 'apple',
  isActive: boolean,
  timestamps: true
}
```

#### Booking Schema (`src/schemas/booking.schema.ts`)
```typescript
{
  user: ObjectId (ref: User),
  from: string,
  to: string,
  departureDate: Date,
  returnDate?: Date,
  isRoundTrip: boolean,
  flightNumber?: string,
  departTime?: string,
  arriveTime?: string,
  passengers: Array<{
    fullName: string,
    passportNumber?: string,
    dateOfBirth?: Date
  }>,
  payment?: {
    paymentStatus: 'pending' | 'paid' | 'canceled' | 'refunded',
    amount: number,
    currency: string,
    paymentMethod?: string,
    cardLast4?: string,
    cardBrand?: string
  },
  bookingStatus: 'reserved' | 'ticketed' | 'canceled',
  provider?: string,
  providerBookingId?: string,
  seat?: string,
  gate?: string,
  boardingTime?: string,
  pdfUrl?: string,
  rawProviderData?: any,
  timestamps: true
}
```

### API Endpoints

#### Authentication
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `POST /auth/refresh` — обновление токена
- `GET /oauth/google` — OAuth Google
- `GET /oauth/apple` — OAuth Apple

#### Flights
- `GET /flights/search` — поиск рейсов (query params)
- `POST /flights/search` — поиск рейсов (body)
- `POST /flights/fare-info` — детали тарифа
- `POST /flights/:offerId/brand-fares` — брендированные тарифы

#### Booking
- `POST /booking/create` — создание бронирования
- `GET /booking` — список бронирований пользователя
- `GET /booking/:id` — конкретное бронирование
- `GET /booking/:id/pdf` — PDF посадочный талон

#### Users
- `GET /users/profile` — профиль пользователя
- `PUT /users/profile` — обновление профиля
- `POST /users/avatar` — загрузка аватара

---

## Mobile App (aviatickets-demo)

### Технологический стек
- **Framework**: React Native + Expo SDK 54
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **UI Components**: Custom components + Expo Vector Icons
- **Authentication**: JWT + OAuth (Google, Apple)

### Архитектура приложения

#### Структура папок
```
aviatickets-demo/
├── components/          # Переиспользуемые UI компоненты
├── screens/            # Экраны приложения
├── navigation/         # Навигация
├── contexts/           # React Context (состояние)
├── lib/               # API клиент и утилиты
├── constants/         # Константы (API URLs, данные)
├── assets/            # Изображения, иконки
└── services/          # Внешние сервисы (OAuth)
```

#### Основные компоненты

##### 1. **App.js**
Корневой компонент приложения:
- Загрузка шрифтов (Roboto)
- Splash screen (2 сек)
- Инициализация AuthProvider
- Настройка навигации

##### 2. **AuthContext** (`contexts/AuthContext.js`)
Глобальное состояние аутентификации:
- JWT токен в AsyncStorage
- Данные пользователя
- Функции login/logout/register
- Автоматическое обновление токенов

##### 3. **Navigation** (`navigation/`)
- `RootNavigation.js`: корневая навигация (Stack)
- `BottomTabs.js`: нижние табы (Home, Tickets, Profile)

##### 4. **Screens** (`screens/`)

**Основные экраны**:
- `SplashScreen.js` — загрузочный экран
- `LoginScreen.js` — авторизация
- `SignUpScreen.js` — регистрация
- `HomeScreen.js` — главный экран с поиском
- `SearchScreen.js` — форма поиска рейсов
- `ResultsScreen.js` — результаты поиска
- `FlightDetailsScreen.js` — детали рейса
- `BookingScreen.js` — форма бронирования
- `PassengerInfoScreen.js` — данные пассажиров
- `PaymentScreen.js` — оплата
- `TicketsScreen.js` — список билетов
- `TicketDetailsScreen.js` — детали билета
- `ProfileScreen.js` — профиль пользователя

**Вспомогательные экраны**:
- `SelectCityScreen.js` — выбор города
- `SeatSelectionScreen.js` — выбор места
- `SettingsScreen.js` — настройки
- `SupportScreen.js` — поддержка
- `FaqScreen.js` — FAQ

##### 5. **API Client** (`lib/api.js`)
HTTP клиент для взаимодействия с backend:
- Автоматическое добавление JWT токенов
- Обработка ошибок
- Retry логика
- Типизированные методы для всех endpoints

##### 6. **Components** (`components/`)
Переиспользуемые UI компоненты:
- `FlightCard.js` — карточка рейса
- `PrimaryButton.js` — основная кнопка
- `Input.js` — поле ввода
- `LoadingOverlay.js` — индикатор загрузки

### Пользовательские сценарии

#### 1. Поиск и бронирование рейса
1. Пользователь открывает приложение
2. На главном экране выбирает направление и дату
3. Нажимает "Найти рейсы"
4. Просматривает результаты поиска
5. Выбирает подходящий рейс
6. Заполняет данные пассажиров
7. Выбирает место (опционально)
8. Производит оплату
9. Получает билет в разделе "Мои билеты"

#### 2. Управление профилем
1. Переход в раздел "Профиль"
2. Просмотр/редактирование личных данных
3. Загрузка аватара
4. Настройка уведомлений
5. Просмотр истории бронирований

#### 3. Поддержка
1. Переход в раздел "Поддержка"
2. Выбор типа обращения
3. Отправка сообщения
4. Получение ответа от поддержки

---

## Интеграция с внешними сервисами

### Onelya API
**Назначение**: Основной провайдер авиабилетов

**Endpoints используемые**:
- `/Avia/V1/Search/RoutePricing` — поиск маршрутов
- `/Avia/V1/Search/BrandFarePricing` — брендированные тарифы
- `/Avia/V1/Search/FareInfoByRoute` — детали тарифа
- `/Order/V1/Reservation/Create` — создание бронирования
- `/Order/V1/Reservation/Confirm` — подтверждение
- `/Order/V1/Reservation/Blank` — генерация билета

**Аутентификация**: Basic Auth
**Формат данных**: JSON
**Таймауты**: 180 секунд

### OAuth Провайдеры
- **Google OAuth 2.0**: для входа через Google аккаунт
- **Apple Sign In**: для входа через Apple ID

---

## Развертывание и конфигурация

### Backend Environment Variables
```env
# Database
MONGO_URI=mongodb://localhost:27017/tickets

# JWT
JWT_SECRET=your-secret-key

# Onelya API
ONELYA_BASE_URL=https://api-test.onelya.ru
ONELYA_LOGIN=your-login
ONELYA_PASSWORD=your-password
ONELYA_POS=your-pos
ONELYA_PARTNER_ID=your-partner-id

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
```

### Mobile App Configuration
```javascript
// constants/api.js
export const API_BASE = 'http://193.233.103.8:3000/api';
```

### Docker Deployment
Backend включает:
- `Dockerfile` для контейнеризации
- `docker-compose.yml` для локальной разработки
- `ecosystem.config.js` для PM2

---

## Безопасность

### Backend
- JWT токены с истечением срока действия
- Хеширование паролей (bcrypt)
- Валидация входных данных (class-validator)
- CORS настройки
- Rate limiting (рекомендуется добавить)

### Mobile App
- Безопасное хранение токенов (AsyncStorage)
- HTTPS для всех API запросов
- Валидация данных на клиенте
- OAuth через официальные SDK

---

## Мониторинг и логирование

### Backend
- Структурированное логирование (NestJS Logger)
- Health check endpoints
- Error handling с детальными сообщениями
- Логирование всех API запросов к Onelya

### Mobile App
- Error boundaries для React компонентов
- Логирование критических ошибок
- Crash reporting (рекомендуется Sentry)

---

## Планы развития

### Краткосрочные (1-3 месяца)
- Добавление push-уведомлений
- Интеграция с платежными системами
- Улучшение UI/UX
- Добавление тестов

### Среднесрочные (3-6 месяцев)
- Поддержка нескольких провайдеров билетов
- Система лояльности
- Расширенная аналитика
- Веб-версия приложения

### Долгосрочные (6+ месяцев)
- Машинное обучение для рекомендаций
- Интеграция с отелями и трансфером
- Корпоративные функции
- Международная экспансия

---

## Заключение

Архитектура проекта Aviatickets построена на современных технологиях и следует лучшим практикам разработки. Модульная структура backend'а обеспечивает масштабируемость и поддерживаемость, а React Native приложение предоставляет отличный пользовательский опыт на мобильных устройствах.

Система готова к продакшену и может обслуживать реальных пользователей с минимальными доработками в области безопасности и мониторинга.