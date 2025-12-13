# ПОЛНАЯ АРХИТЕКТУРА ПРОЕКТА AVIATICKETS MARKET

## 🏗️ ОБЩАЯ СТРУКТУРА ПРОЕКТА

```
aviaticketsmarketnew/
├── 📱 aviatickets-demo/          # React Native приложение (фронтенд)
├── 🔧 tickets-backend/           # NestJS API сервер (бэкенд)
├── 📄 tickets-backend.tar.gz     # Архив бэкенда
├── 📋 DETAILED_PROJECT_STRUCTURE.md
└── 📋 COMPLETE_PROJECT_ARCHITECTURE.md
```

---

## 📱 FRONTEND АРХИТЕКТУРА (React Native + Expo)

### 🎯 ТЕХНОЛОГИЧЕСКИЙ СТЕК
```json
{
  "framework": "React Native 0.81.5",
  "platform": "Expo ~54.0.23",
  "navigation": "@react-navigation/native ^7.1.20",
  "state": "React Context + AsyncStorage",
  "ui": "Custom Components + Expo Vector Icons",
  "animations": "react-native-reanimated ~4.1.1",
  "graphics": "react-native-svg ^15.15.1",
  "auth": "expo-auth-session + OAuth providers"
}
```

### 📂 СТРУКТУРА ПАПОК ФРОНТЕНДА

#### `/screens/` - 21 ЭКРАН ПРИЛОЖЕНИЯ
```
screens/
├── 🏠 ОСНОВНЫЕ ЭКРАНЫ
│   ├── HomeScreen.js              # Главный экран поиска
│   ├── SearchScreen.js            # Альтернативный поиск (демо)
│   ├── ResultsScreen.js           # Результаты поиска
│   └── SplashScreen.js            # Экран загрузки
│
├── ✈️ БРОНИРОВАНИЕ И БИЛЕТЫ
│   ├── FlightDetailsScreen.js     # Детали рейса с тарифами
│   ├── BookingScreen.js           # Подтверждение бронирования
│   ├── PassengerInfoScreen.js     # Данные пассажиров
│   ├── SeatSelectionScreen.js     # Выбор мест
│   ├── PaymentScreen.js           # Оплата билетов
│   ├── TicketsScreen.js           # Список билетов
│   └── TicketDetailsScreen.js     # Детали билета
│
├── 🔐 АВТОРИЗАЦИЯ
│   ├── LoginScreen.js             # Вход (Email + OAuth)
│   ├── SignUpScreen.js            # Регистрация
│   └── LogoutScreen.js            # Выход
│
├── 👤 ПРОФИЛЬ И НАСТРОЙКИ
│   ├── ProfileScreen.js           # Главная профиля
│   ├── AccountScreen.js           # Настройки аккаунта
│   └── SettingsScreen.js          # Общие настройки
│
├── 💳 ПЛАТЕЖИ
│   └── PaymentsScreen.js          # История платежей
│
├── 🆘 ПОДДЕРЖКА
│   ├── SupportScreen.js           # Чат поддержки
│   ├── SupportOptionsScreen.js    # Варианты обращения
│   └── FaqScreen.js               # FAQ
│
└── 🔧 СЛУЖЕБНЫЕ
    └── SelectCityScreen.js        # Выбор города
```

#### `/components/` - ПЕРЕИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ
```
components/
├── FlightCard.js                  # Карточка рейса (билет-стиль)
├── Input.js                       # Кастомное поле ввода
├── LoadingOverlay.js              # Полноэкранная загрузка
└── PrimaryButton.js               # Основная кнопка
```

#### `/navigation/` - НАВИГАЦИЯ
```
navigation/
├── RootNavigation.js              # Корневая навигация (Stack)
└── BottomTabs.js                  # Нижние вкладки (Home/Tickets/Profile)
```

#### `/contexts/` - УПРАВЛЕНИЕ СОСТОЯНИЕМ
```
contexts/
└── AuthContext.js                 # JWT токены + данные пользователя
```

#### `/lib/` и `/services/` - API И СЕРВИСЫ
```
lib/
└── api.js                         # HTTP клиент с токенами

services/
└── authProviders.js               # OAuth (Google, Yandex, Mail.ru, Apple)
```

#### `/assets/` - РЕСУРСЫ
```
assets/
├── icons/                         # Иконки табов
│   ├── tab-home.png
│   ├── tab-tickets.png
│   └── tab-profile.png
├── plane.png                      # Иконка самолета
├── home-wave.png                  # Волновой фон
└── avatar-placeholder.png         # Заглушка аватара
```

### 🔄 ПОТОКИ ДАННЫХ ФРОНТЕНДА

#### ПОТОК ПОИСКА РЕЙСОВ
```
HomeScreen → POST /flights/search → ResultsScreen → FlightDetailsScreen
    ↓
Onelya API (RoutePricing + BrandFarePricing)
    ↓
Массив карточек рейсов с тарифами
```

#### ПОТОК БРОНИРОВАНИЯ
```
FlightDetailsScreen → PassengerInfoScreen → BookingScreen → PaymentScreen
    ↓                      ↓                    ↓              ↓
Выбор тарифа         Данные пассажиров    Onelya Create   Onelya Confirm
    ↓                      ↓                    ↓              ↓
Переход к данным     Валидация форм       Резервация      Оплата
```

#### ПОТОК АВТОРИЗАЦИИ
```
LoginScreen → AuthContext → JWT Token → Защищенные запросы
    ↓
OAuth (Google/Yandex/Mail.ru/Apple) или Email/Password
    ↓
Сохранение в SecureStore + AsyncStorage
```

---

## 🔧 BACKEND АРХИТЕКТУРА (NestJS + TypeScript)

### 🎯 ТЕХНОЛОГИЧЕСКИЙ СТЕК
```json
{
  "framework": "NestJS ^10.0.0",
  "language": "TypeScript ^5.9.3",
  "database": "MongoDB + Mongoose ^8.19.3",
  "auth": "JWT + Passport + OAuth",
  "http": "Axios ^1.13.2",
  "pdf": "PDFKit ^0.17.2",
  "barcode": "bwip-js ^4.8.0",
  "transliteration": "cyrillic-to-translit-js ^3.2.1"
}
```

### 📂 СТРУКТУРА МОДУЛЕЙ БЭКЕНДА

#### `/src/app.module.ts` - КОРНЕВОЙ МОДУЛЬ
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    HttpModule.register({ timeout: 15000 }),
    FlightsModule, BookingModule, AuthModule,
    UsersModule, FaqModule, SupportModule, OnelyaModule
  ]
})
```

#### `/src/flights/` - МОДУЛЬ ПОИСКА РЕЙСОВ
```
flights/
├── flights.controller.ts          # REST API поиска
├── flights.service.ts             # Бизнес-логика поиска
├── flights.module.ts              # Модуль NestJS
├── flight-offer.store.ts          # In-memory хранилище предложений
├── flight-offer.entity.ts         # Сущность предложения
└── direct-search.controller.ts    # Прямой поиск
```

**flights.service.ts - СЛОЖНАЯ ЛОГИКА ПОИСКА:**
```typescript
async search(payload) {
  // 1. RoutePricing - базовый поиск рейсов
  const routeResp = await this.onelyaService.routePricing(routeReq);
  
  // 2. BrandFarePricing - брендированные тарифы (batch по 5)
  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE);
    const promises = batch.map(route => 
      this.onelyaService.brandFarePricing(this.buildBrandFareRequest(route))
    );
    const resolved = await Promise.all(promises);
    enrichedRoutes.push(...resolved);
  }
  
  // 3. Преобразование в формат фронтенда
  const cards = enrichedRoutes.map(route => this.routeToCard(route));
  return { Routes: enrichedRoutes, results: cards };
}
```

#### `/src/onelya/` - ИНТЕГРАЦИЯ С ONELYA API
```
onelya/
├── onelya.controller.ts           # Прокси к Onelya API
├── onelya.service.ts              # HTTP клиент Onelya
├── onelya.module.ts               # Модуль NestJS
├── onelya.health.controller.ts    # Health check
├── dto/                           # TypeScript типы
│   ├── avia-search.dto.ts         # Типы поиска рейсов
│   └── order-reservation.dto.ts   # Типы бронирований
└── interceptors/
    └── onelya-logging.interceptor.ts # Логирование запросов
```

**onelya.service.ts - HTTP КЛИЕНТ:**
```typescript
@Injectable()
export class OnelyaService {
  private readonly baseUrl = 'https://api-test.onelya.ru/';
  private readonly timeoutMs = 180000; // 3 минуты
  
  async routePricing(body: RoutePricingRequest): Promise<RoutePricingResponse> {
    const response = await this.post('/Avia/V1/Search/RoutePricing', body);
    // Сохранение предложений в flight-offer.store
    if (Array.isArray(response?.Routes)) {
      response.Routes.forEach(route => 
        flightOfferStore.save(route, route.CheapestPrice, route.Currency)
      );
    }
    return response;
  }
  
  async createReservation(body: any) {
    const customers = body.passengers.map(mapPassengerToOnelyaCustomer);
    return this.post('/Order/V1/Reservation/Create', {
      Customers: customers,
      ReservationItems: [{ Provider: 'Onelya', ProviderRaw: body.route }],
      ContactPhone: body.contact?.phone,
      ContactEmails: [body.contact?.email]
    });
  }
}
```

#### `/src/booking/` - МОДУЛЬ БРОНИРОВАНИЙ
```
booking/
├── booking.controller.ts          # REST API бронирований
├── booking.service.ts             # Бизнес-логика бронирований
└── booking.module.ts              # Модуль NestJS
```

**booking.service.ts - СЛОЖНАЯ ЛОГИКА БРОНИРОВАНИЙ:**
```typescript
@Injectable()
export class BookingService {
  async create(userId: string, body: any): Promise<CreateResult> {
    return this.createOnelya(userId, body); // Основной путь
  }
  
  async createOnelya(userId: string, body: any): Promise<CreateResult> {
    try {
      // Попытка создать через Onelya API
      const data = await this.onelyaService.createReservation(body.onelyaReservation);
      
      // Сохранение в MongoDB
      const booking = new this.bookingModel({
        user: new Types.ObjectId(userId),
        providerBookingId: data.OrderId,
        bookingStatus: 'reserved',
        provider: 'onelya',
        rawProviderData: data
      });
      await booking.save();
      
      return { success: true, booking, raw: data };
    } catch (err) {
      // Fallback на локальное бронирование
      const booking = await this.createLocal(userId, body);
      return { success: false, booking, error: err.message };
    }
  }
  
  // PDF генерация с штрихкодами
  async getPdf(bookingId: string): Promise<Buffer> {
    const doc = new PDFDocument();
    // Русские шрифты + штрихкод + дизайн билета
    const barcode = await bwipjs.toBuffer({
      bcid: 'code128', text: bookingId
    });
    doc.image(barcode);
    return pdfBuffer;
  }
}
```

#### `/src/auth/` - МОДУЛЬ АВТОРИЗАЦИИ
```
auth/
├── auth.controller.ts             # Email/пароль авторизация
├── oauth.controller.ts            # OAuth провайдеры
├── auth.service.ts                # JWT токены
├── oauth.service.ts               # Google/Yandex/Mail.ru/Apple
├── auth.module.ts                 # Модуль NestJS
├── dto/                           # DTO авторизации
└── guards/
    └── jwt-auth.guard.ts          # JWT защита маршрутов
```

#### `/src/users/` - УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
```
users/
├── users.controller.ts            # CRUD пользователей
├── users.service.ts               # Бизнес-логика пользователей
├── users.module.ts                # Модуль NestJS
└── dto/
    └── update-user.dto.ts         # DTO обновления
```

#### `/src/support/` - МОДУЛЬ ПОДДЕРЖКИ
```
support/
├── support.controller.ts          # API обращений
├── support.service.ts             # Обработка сообщений
└── support.module.ts              # Модуль NestJS
```

#### `/src/faq/` - БАЗА ЗНАНИЙ
```
faq/
├── faq.controller.ts              # API FAQ
├── faq.service.ts                 # Управление вопросами
├── faq.module.ts                  # Модуль NestJS
├── faq-seed.service.ts            # Заполнение тестовыми данными
└── seed-faq.ts                    # Скрипт инициализации
```

#### `/src/schemas/` - MONGODB СХЕМЫ
```
schemas/
├── booking.schema.ts              # Схема бронирований
├── user.schema.ts                 # Схема пользователей
├── support-message.schema.ts      # Схема сообщений поддержки
└── faq.schema.ts                  # Схема FAQ
```

### 🔄 API ENDPOINTS БЭКЕНДА

#### ПОИСК РЕЙСОВ
```
POST /flights/search               # Поиск рейсов (RoutePricing + BrandFarePricing)
POST /flights/fare-info            # Детальная информация о тарифе
```

#### ONELYA API ПРОКСИ
```
POST /onelya/avia/search/route-pricing        # Базовый поиск
POST /onelya/avia/search/brand-fare-pricing   # Брендированные тарифы
POST /onelya/order/reservation/create         # Создание резервации
POST /onelya/order/reservation/confirm        # Подтверждение бронирования
POST /onelya/order/reservation/blank          # Получение PDF билета
POST /onelya/order/reservation/void           # Отмена резервации
```

#### БРОНИРОВАНИЯ
```
POST /booking/create               # Создание бронирования (JWT)
GET  /booking                      # Список бронирований пользователя (JWT)
GET  /booking/:id                  # Конкретное бронирование (JWT)
GET  /booking/:id/pdf              # PDF билет с штрихкодом (JWT)
```

#### АВТОРИЗАЦИЯ
```
POST /auth/login                   # Email/пароль вход
POST /auth/register                # Регистрация
POST /auth/google                  # Google OAuth
POST /auth/yandex                  # Yandex OAuth
POST /auth/mail                    # Mail.ru OAuth
POST /auth/apple                   # Apple OAuth (iOS)
```

---

## 🔄 ИНТЕГРАЦИЯ ФРОНТЕНДА И БЭКЕНДА

### ПОТОК ПОИСКА РЕЙСОВ
```
1. HomeScreen.js → POST /flights/search
   ├── origin: "SVO", destination: "LED"
   ├── departureDate: "2025-12-10T00:00:00"
   ├── passengers: 1, serviceClass: "Economic"
   └── tariff: "Standard"

2. flights.service.ts → Onelya API
   ├── RoutePricing (базовый поиск)
   ├── BrandFarePricing (тарифы для каждого рейса)
   └── Преобразование в формат фронтенда

3. ResultsScreen.js ← Массив карточек
   ├── results: [{ id, price, fares, segments, providerRaw }]
   └── Routes: [сырые данные Onelya]
```

### ПОТОК БРОНИРОВАНИЯ
```
1. BookingScreen.js → POST /onelya/order/reservation/create
   ├── route: providerRaw (данные из поиска)
   ├── passengers: [{ firstName, lastName, passport }]
   └── contact: { phone, email }

2. onelya.service.ts → Onelya Reservation/Create
   ├── Трансформация пассажиров (транслитерация)
   ├── Создание ReservationItems
   └── Получение OrderId

3. PaymentScreen.js → POST /onelya/order/reservation/confirm
   ├── orderId: полученный OrderId
   └── paymentMethod: "Cashless"

4. TicketsScreen.js ← Список билетов пользователя
```

### СИСТЕМА АВТОРИЗАЦИИ
```
1. LoginScreen.js → POST /auth/login или OAuth
   ├── Email/пароль: { email, password }
   └── OAuth: { code, redirectUri }

2. auth.service.ts → JWT токен
   ├── Проверка учетных данных
   ├── Генерация JWT токена
   └── Возврат { accessToken, user }

3. AuthContext → Сохранение состояния
   ├── SecureStore: JWT токен
   ├── AsyncStorage: данные пользователя
   └── Автоматическое добавление в заголовки запросов
```

---

## 🚀 АРХИТЕКТУРНЫЕ ОСОБЕННОСТИ

### ОТКАЗОУСТОЙЧИВОСТЬ
```
├── Onelya API недоступен → Fallback на локальные бронирования
├── Поиск рейсов упал → Демо-данные с тестовыми рейсами
├── BrandFarePricing ошибка → Использование базовых тарифов
└── OAuth провайдер недоступен → Email/пароль авторизация
```

### ПРОИЗВОДИТЕЛЬНОСТЬ
```
├── Batch обработка BrandFarePricing (по 5 запросов)
├── In-memory хранилище предложений (flight-offer.store)
├── Кеширование результатов поиска
└── Оптимизированные MongoDB запросы с индексами
```

### БЕЗОПАСНОСТЬ
```
├── JWT токены с проверкой на каждом защищенном маршруте
├── Валидация всех входящих данных через DTO
├── Хеширование паролей с bcrypt
├── CORS настройки для продакшена
└── Транслитерация кириллицы для Onelya API
```

### МОНИТОРИНГ И ЛОГИРОВАНИЕ
```
├── Детальное логирование всех Onelya API запросов
├── Отслеживание времени выполнения операций
├── Сохранение raw ответов провайдеров для отладки
├── Health check endpoints для мониторинга
└── Interceptors для автоматического логирования
```

---

## 📊 СТАТИСТИКА ПРОЕКТА

### ФРОНТЕНД
```
├── 21 экран React Native
├── 4 переиспользуемых компонента
├── 1 контекст управления состоянием
├── 2 навигатора (Stack + BottomTabs)
├── 5 OAuth провайдеров
└── 15+ внешних зависимостей
```

### БЭКЕНД
```
├── 7 функциональных модулей NestJS
├── 4 MongoDB схемы
├── 15+ REST API endpoints
├── 10+ Onelya API интеграций
├── JWT + OAuth авторизация
└── PDF генерация с штрихкодами
```

### ИНТЕГРАЦИИ
```
├── Onelya API - российская система бронирования
├── Google OAuth - авторизация через Google
├── Yandex OAuth - авторизация через Yandex
├── Mail.ru OAuth - авторизация через Mail.ru
├── Apple OAuth - авторизация через Apple (iOS)
└── MongoDB - NoSQL база данных
```

Проект представляет собой полнофункциональную систему бронирования авиабилетов с современной архитектурой, интеграцией российского провайдера Onelya и мобильным интерфейсом мирового уровня.