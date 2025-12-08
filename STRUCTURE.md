# 📁 Структура проекта Aviatickets

```
aviaticketsmarketnew/
│
├── 📱 aviatickets-demo/                    # React Native приложение (Expo)
│   │
│   ├── screens/                            # Экраны приложения
│   │   ├── HomeScreen.js                   # Главный экран
│   │   ├── LoginScreen.js                  # Вход
│   │   ├── SignUpScreen.js                 # Регистрация
│   │   ├── SearchScreen.js                 # Поиск рейсов
│   │   ├── ResultsScreen.js                # Результаты поиска
│   │   ├── FlightDetailsScreen.js          # Детали рейса
│   │   ├── BookingScreen.js                # Бронирование
│   │   ├── PassengerInfoScreen.js          # Информация о пассажирах
│   │   ├── SeatSelectionScreen.js          # Выбор места
│   │   ├── PaymentScreen.js                # Оплата
│   │   ├── PaymentsScreen.js               # История платежей
│   │   ├── TicketsScreen.js                # Мои билеты
│   │   ├── ProfileScreen.js                # Профиль
│   │   ├── AccountScreen.js                # Редактирование профиля
│   │   ├── SettingsScreen.js               # Настройки
│   │   ├── FaqScreen.js                    # FAQ
│   │   ├── SupportScreen.js                # Чат поддержки
│   │   ├── SupportOptionsScreen.js         # Опции поддержки
│   │   ├── SelectCityScreen.js             # Выбор города
│   │   ├── SplashScreen.js                 # Загрузочный экран
│   │   └── LogoutScreen.js                 # Выход
│   │
│   ├── navigation/                         # Навигация
│   │   ├── RootNavigation.js               # Корневая навигация (Stack)
│   │   └── BottomTabs.js                   # Нижние вкладки (Home, Tickets, Profile)
│   │
│   ├── contexts/                           # React Context
│   │   └── AuthContext.js                  # Управление авторизацией (login, register, logout)
│   │
│   ├── lib/                                # Утилиты
│   │   └── api.js                          # Централизованный HTTP клиент
│   │
│   ├── constants/                          # Константы
│   │   ├── api.js                          # API_BASE URL (http://193.233.103.8:3000/api)
│   │   └── airports.js                     # Список аэропортов
│   │
│   ├── components/                         # Переиспользуемые компоненты
│   │   ├── FlightCard.js                   # Карточка рейса
│   │   ├── Input.js                        # Поле ввода
│   │   ├── LoadingOverlay.js               # Индикатор загрузки
│   │   └── PrimaryButton.js                # Кнопка
│   │
│   ├── assets/                             # Статические ресурсы
│   │   ├── icons/                          # Иконки навигации
│   │   │   ├── tab-home.png
│   │   │   ├── tab-tickets.png
│   │   │   └── tab-profile.png
│   │   ├── icon.png                        # Иконка приложения
│   │   ├── splash-icon.png                 # Splash screen
│   │   ├── plane.png                       # Изображение самолета
│   │   └── avatar-placeholder.png          # Аватар по умолчанию
│   │
│   ├── hooks/                              # Custom hooks
│   │   └── useFonts.js                     # Загрузка шрифтов
│   │
│   ├── data/                               # Данные
│   │   └── airports.js                     # Список аэропортов
│   │
│   ├── App.js                              # Точка входа приложения
│   ├── index.js                            # Регистрация компонента
│   ├── app.json                            # Конфигурация Expo
│   ├── package.json                        # Зависимости
│   └── eas.json                            # EAS Build конфигурация
│
├── 🖥️ tickets-backend/                     # NestJS Backend
│   │
│   ├── src/
│   │   │
│   │   ├── auth/                           # 🔐 Модуль авторизации
│   │   │   ├── auth.controller.ts          # POST /api/auth/login, /api/auth/register
│   │   │   ├── auth.service.ts             # Логика авторизации (JWT, bcrypt)
│   │   │   ├── auth.module.ts              # Модуль
│   │   │   ├── dto/                        # Data Transfer Objects
│   │   │   │   ├── login.dto.ts            # DTO для входа
│   │   │   │   ├── register.dto.ts         # DTO для регистрации
│   │   │   │   └── oauth.dto.ts            # DTO для Google/Apple OAuth
│   │   │   └── guards/                     # Guards
│   │   │       └── jwt-auth.guard.ts       # JWT защита роутов
│   │   │
│   │   ├── users/                          # 👤 Модуль пользователей
│   │   │   ├── users.controller.ts         # GET /api/me, PUT /api/me, POST /api/me/avatar
│   │   │   ├── users.service.ts            # Управление пользователями
│   │   │   ├── users.module.ts             # Модуль
│   │   │   └── dto/                        # Data Transfer Objects
│   │   │       └── update-user.dto.ts      # DTO для обновления профиля
│   │   │
│   │   ├── booking/                        # 🎫 Модуль бронирований
│   │   │   ├── booking.controller.ts       # POST /api/booking/create
│   │   │   ├── booking.service.ts          # GET /api/booking, /api/booking/:id
│   │   │   └── booking.module.ts           # GET /api/booking/:id/pdf (генерация PDF)
│   │   │
│   │   ├── flights/                        # ✈️ Модуль рейсов
│   │   │   ├── flights.controller.ts       # POST /api/flights/search
│   │   │   ├── flights.service.ts          # Интеграция с Onelya API
│   │   │   ├── flights.module.ts           # Модуль
│   │   │   └── direct-search.controller.ts # GET /api/flights/direct
│   │   │
│   │   ├── onelya/                         # 🔌 Модуль Onelya API
│   │   │   ├── onelya.controller.ts        # Контроллер
│   │   │   ├── onelya.service.ts           # HTTP клиент для Onelya
│   │   │   ├── onelya.health.controller.ts # GET /api/onelya/health
│   │   │   ├── onelya.module.ts            # Модуль
│   │   │   ├── dto/                        # Data Transfer Objects
│   │   │   └── interceptors/               # HTTP interceptors
│   │   │
│   │   ├── faq/                            # ❓ Модуль FAQ
│   │   │   ├── faq.controller.ts           # GET /api/faq
│   │   │   ├── faq.service.ts              # Управление FAQ
│   │   │   ├── faq.module.ts               # Модуль
│   │   │   ├── faq-seed.service.ts         # Заполнение базы
│   │   │   └── seed-faq.ts                 # Скрипт заполнения
│   │   │
│   │   ├── support/                        # 💬 Модуль поддержки
│   │   │   ├── support.controller.ts       # GET/POST /api/support/messages
│   │   │   ├── support.service.ts          # Управление сообщениями
│   │   │   └── support.module.ts           # Модуль
│   │   │
│   │   ├── schemas/                        # 📄 MongoDB схемы (Mongoose)
│   │   │   ├── user.schema.ts              # Схема пользователя
│   │   │   ├── booking.schema.ts           # Схема бронирования
│   │   │   ├── faq.schema.ts               # Схема FAQ
│   │   │   └── support-message.schema.ts   # Схема сообщения поддержки
│   │   │
│   │   ├── providers/                      # 🔧 Провайдеры
│   │   │   ├── onelya.provider.ts          # Провайдер Onelya
│   │   │   └── provider.interface.ts       # Интерфейс провайдера
│   │   │
│   │   ├── assets/                         # Статические ресурсы
│   │   │   └── fonts/                      # Шрифты для PDF
│   │   │       └── NotoSans-Regular.ttf    # Шрифт с поддержкой кириллицы
│   │   │
│   │   ├── main.ts                         # 🚀 Точка входа (app.setGlobalPrefix('api'))
│   │   ├── app.module.ts                   # Корневой модуль (импорт всех модулей)
│   │   ├── app.controller.ts               # Корневой контроллер
│   │   └── app.service.ts                  # Корневой сервис
│   │
│   ├── scripts/                            # Утилиты и скрипты
│   │   ├── seed-atlas-user.js              # Создание тестового пользователя
│   │   ├── full-diagnosis.js               # Диагностика системы
│   │   └── test-server.sh                  # Тест API endpoints
│   │
│   ├── test/                               # E2E тесты
│   │   ├── app.e2e-spec.ts                 # E2E тесты
│   │   └── jest-e2e.json                   # Конфигурация Jest
│   │
│   ├── .env                                # 🔑 Переменные окружения
│   ├── .dockerignore                       # Docker ignore
│   ├── .eslintrc.js                        # ESLint конфигурация
│   ├── .prettierrc                         # Prettier конфигурация
│   ├── docker-compose.yml                  # Docker Compose
│   ├── Dockerfile                          # Docker образ
│   ├── ecosystem.config.js                 # PM2 конфигурация
│   ├── nest-cli.json                       # NestJS CLI конфигурация
│   ├── tsconfig.json                       # TypeScript конфигурация
│   ├── tsconfig.build.json                 # TypeScript build конфигурация
│   ├── package.json                        # Зависимости
│   └── README.md                           # Документация
│
├── 📚 Документация
│   ├── README.md                           # Основная документация
│   ├── PROJECT_ANALYSIS.md                 # Подробный анализ проекта
│   └── STRUCTURE.md                        # Этот файл
│
└── tickets-backend.tar.gz                  # Архив backend
```

## 📊 Статистика проекта

### Frontend (aviatickets-demo)
- **Экраны:** 21
- **Компоненты:** 4
- **Контексты:** 1
- **Утилиты:** 2
- **Константы:** 2

### Backend (tickets-backend)
- **Модули:** 7 (Auth, Users, Booking, Flights, FAQ, Support, Onelya)
- **Контроллеры:** 10+
- **Сервисы:** 10+
- **Схемы:** 4
- **Endpoints:** 15+

## 🔗 Ключевые связи

```
App.js
  └── AuthProvider (contexts/AuthContext.js)
      └── RootNavigation (navigation/RootNavigation.js)
          ├── LoginScreen → POST /api/auth/login
          ├── SignUpScreen → POST /api/auth/register
          └── BottomTabs
              ├── HomeScreen → POST /api/flights/search
              ├── TicketsScreen → GET /api/booking
              └── ProfileScreen → GET /api/me
```

## 🌐 API Endpoints

| Метод | Endpoint | Описание | Защита |
|-------|----------|----------|--------|
| POST | /api/auth/register | Регистрация | - |
| POST | /api/auth/login | Вход | - |
| GET | /api/me | Профиль | JWT |
| PUT | /api/me | Обновить профиль | JWT |
| POST | /api/booking/create | Создать бронирование | JWT |
| GET | /api/booking | Список бронирований | JWT |
| GET | /api/booking/:id | Получить бронирование | JWT |
| GET | /api/booking/:id/pdf | Скачать PDF | JWT |
| POST | /api/flights/search | Поиск рейсов | - |
| GET | /api/faq | FAQ | - |
| GET | /api/support/messages | Сообщения | JWT |
| POST | /api/support/messages | Отправить сообщение | JWT |

## 🗄️ База данных (MongoDB Atlas)

```
tickets (database)
├── users                    # Пользователи
├── bookings                 # Бронирования
├── faqs                     # FAQ
└── supportmessages          # Сообщения поддержки
```
