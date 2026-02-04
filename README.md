# Aviation Tickets Marketplace

[English](#english) | [Русский](#русский)

## English

A comprehensive flight booking platform built with React Native and NestJS, featuring real-time flight search, booking management, and multi-provider authentication.

### Project Structure

The application consists of two main components:

- **Frontend**: React Native mobile application (`aviatickets-demo/`)
- **Backend**: NestJS REST API server (`tickets-backend/`)

### Features

#### Core Functionality
- Flight search across multiple routes and dates
- Real-time booking system with passenger management
- Secure payment processing and confirmation
- Digital ticket generation with QR codes
- Multi-language support (Russian/English)

#### Authentication & Security
- JWT-based authentication
- OAuth integration (Google, Yandex, Mail.ru, Apple)
- Secure session management
- Password encryption with bcrypt

#### User Experience
- Intuitive flight search interface
- Interactive seat selection
- Passenger information management
- Booking history and ticket storage
- Customer support chat system
- FAQ section with search functionality

#### Technical Features
- Offline ticket access
- Push notifications
- Animated loading states
- Responsive design
- Error handling and validation

### Technology Stack

#### Frontend (React Native)
```
React Native 0.81.5
Expo SDK 54
React Navigation 7
Reanimated 4
AsyncStorage
Expo Vector Icons
```

#### Backend (NestJS)
```
NestJS 10
MongoDB with Mongoose
JWT Authentication
Swagger API Documentation
Passport.js for OAuth
PDFKit for ticket generation
```

#### Development Tools
```
TypeScript
ESLint & Prettier
Jest for testing
Docker support
PM2 process management
```

### Installation

#### Prerequisites
- Node.js 18+
- MongoDB instance
- Expo CLI
- iOS Simulator or Android Emulator

#### Backend Setup

1. Navigate to backend directory:
```bash
cd tickets-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd aviatickets-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on device/simulator:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

### API Documentation

The backend provides comprehensive API documentation via Swagger UI, accessible at:
```
http://localhost:3000/api/docs
```

#### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /flights/search` - Flight search
- `POST /booking` - Create booking
- `GET /booking/:id` - Retrieve booking details
- `POST /booking/:id/pay` - Process payment
- `GET /support/messages` - Support chat

### Configuration

#### Environment Variables

Backend configuration (`.env`):
```
DATABASE_URL=mongodb://localhost:27017/aviatickets
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
YANDEX_CLIENT_ID=your-yandex-client-id
MAILRU_CLIENT_ID=your-mailru-client-id
```

Frontend configuration (`app.json`):
```json
{
  "extra": {
    "apiBase": "https://your-api-domain.com/api",
    "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "your-google-client-id"
  }
}
```

### Development

#### Code Structure

The codebase follows clean architecture principles:

- **Components**: Reusable UI components
- **Screens**: Application screens and navigation
- **Services**: Business logic and API integration
- **Utils**: Helper functions and utilities
- **Contexts**: State management with React Context

#### Code Quality

- TypeScript for type safety
- ESLint configuration for code consistency
- Prettier for code formatting
- Comprehensive error handling
- Input validation and sanitization

#### Testing

Run the test suite:
```bash
# Backend tests
cd tickets-backend
npm test

# Frontend tests (if configured)
cd aviatickets-demo
npm test
```

### Deployment

#### Backend Deployment

The backend includes Docker configuration for containerized deployment:

```bash
docker build -t aviatickets-backend .
docker run -p 3000:3000 aviatickets-backend
```

Production deployment with PM2:
```bash
npm run build
pm2 start ecosystem.config.js
```

#### Frontend Deployment

Build for production:
```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
expo build:web
```

### Architecture Decisions

#### Database Design
- MongoDB for flexible document storage
- Separate collections for users, bookings, flights
- Indexed queries for performance optimization

#### Authentication Flow
- JWT tokens for stateless authentication
- Refresh token rotation for security
- OAuth providers for social login

#### State Management
- React Context for global state
- Local state for component-specific data
- AsyncStorage for persistent data

#### API Design
- RESTful endpoints with consistent naming
- Comprehensive error responses
- Request/response validation
- Rate limiting and security headers

### Performance Considerations

- Lazy loading for screens and components
- Image optimization and caching
- Database query optimization
- API response caching
- Bundle size optimization

### Security Measures

- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Secure headers implementation
- Environment variable protection

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Ensure code quality standards
5. Submit a pull request

### License

This project is licensed under the 0BSD License - see the LICENSE file for details.

### Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the FAQ section in the application

---

## Русский

Комплексная платформа для бронирования авиабилетов, построенная на React Native и NestJS, с функциями поиска рейсов в реальном времени, управления бронированием и многопровайдерной аутентификации.

### Структура проекта

Приложение состоит из двух основных компонентов:

- **Frontend**: Мобильное приложение React Native (`aviatickets-demo/`)
- **Backend**: REST API сервер NestJS (`tickets-backend/`)

### Функциональность

#### Основные возможности
- Поиск рейсов по различным маршрутам и датам
- Система бронирования в реальном времени с управлением пассажирами
- Безопасная обработка платежей и подтверждение
- Генерация цифровых билетов с QR-кодами
- Поддержка нескольких языков (русский/английский)

#### Аутентификация и безопасность
- JWT-аутентификация
- OAuth интеграция (Google, Yandex, Mail.ru, Apple)
- Безопасное управление сессиями
- Шифрование паролей с bcrypt

#### Пользовательский опыт
- Интуитивный интерфейс поиска рейсов
- Интерактивный выбор мест
- Управление информацией о пассажирах
- История бронирований и хранение билетов
- Система чата поддержки клиентов
- Раздел FAQ с функцией поиска

#### Технические возможности
- Офлайн доступ к билетам
- Push-уведомления
- Анимированные состояния загрузки
- Адаптивный дизайн
- Обработка ошибок и валидация

### Технологический стек

#### Frontend (React Native)
```
React Native 0.81.5
Expo SDK 54
React Navigation 7
Reanimated 4
AsyncStorage
Expo Vector Icons
```

#### Backend (NestJS)
```
NestJS 10
MongoDB с Mongoose
JWT Authentication
Swagger API Documentation
Passport.js для OAuth
PDFKit для генерации билетов
```

#### Инструменты разработки
```
TypeScript
ESLint & Prettier
Jest для тестирования
Поддержка Docker
Управление процессами PM2
```

### Установка

#### Требования
- Node.js 18+
- Экземпляр MongoDB
- Expo CLI
- iOS Simulator или Android Emulator

#### Настройка Backend

1. Перейдите в директорию backend:
```bash
cd tickets-backend
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env с вашей конфигурацией
```

4. Запустите сервер разработки:
```bash
npm run start:dev
```

API будет доступно по адресу `http://localhost:3000`

#### Настройка Frontend

1. Перейдите в директорию frontend:
```bash
cd aviatickets-demo
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер разработки Expo:
```bash
npm start
```

4. Запустите на устройстве/симуляторе:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

### Документация API

Backend предоставляет полную документацию API через Swagger UI, доступную по адресу:
```
http://localhost:3000/api/docs
```

#### Основные эндпоинты

- `POST /auth/login` - Аутентификация пользователя
- `GET /flights/search` - Поиск рейсов
- `POST /booking` - Создание бронирования
- `GET /booking/:id` - Получение деталей бронирования
- `POST /booking/:id/pay` - Обработка платежа
- `GET /support/messages` - Чат поддержки

### Конфигурация

#### Переменные окружения

Конфигурация Backend (`.env`):
```
DATABASE_URL=mongodb://localhost:27017/aviatickets
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
YANDEX_CLIENT_ID=your-yandex-client-id
MAILRU_CLIENT_ID=your-mailru-client-id
```

Конфигурация Frontend (`app.json`):
```json
{
  "extra": {
    "apiBase": "https://your-api-domain.com/api",
    "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "your-google-client-id"
  }
}
```

### Разработка

#### Структура кода

Кодовая база следует принципам чистой архитектуры:

- **Components**: Переиспользуемые UI компоненты
- **Screens**: Экраны приложения и навигация
- **Services**: Бизнес-логика и интеграция с API
- **Utils**: Вспомогательные функции и утилиты
- **Contexts**: Управление состоянием с React Context

#### Качество кода

- TypeScript для типобезопасности
- Конфигурация ESLint для консистентности кода
- Prettier для форматирования кода
- Комплексная обработка ошибок
- Валидация и санитизация входных данных

#### Тестирование

Запуск тестов:
```bash
# Тесты Backend
cd tickets-backend
npm test

# Тесты Frontend (если настроены)
cd aviatickets-demo
npm test
```

### Развертывание

#### Развертывание Backend

Backend включает конфигурацию Docker для контейнеризованного развертывания:

```bash
docker build -t aviatickets-backend .
docker run -p 3000:3000 aviatickets-backend
```

Продакшн развертывание с PM2:
```bash
npm run build
pm2 start ecosystem.config.js
```

#### Развертывание Frontend

Сборка для продакшн:
```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
expo build:web
```

### Архитектурные решения

#### Дизайн базы данных
- MongoDB для гибкого хранения документов
- Отдельные коллекции для пользователей, бронирований, рейсов
- Индексированные запросы для оптимизации производительности

#### Поток аутентификации
- JWT токены для stateless аутентификации
- Ротация refresh токенов для безопасности
- OAuth провайдеры для социального входа

#### Управление состоянием
- React Context для глобального состояния
- Локальное состояние для компонент-специфичных данных
- AsyncStorage для постоянных данных

#### Дизайн API
- RESTful эндпоинты с консистентным именованием
- Комплексные ответы об ошибках
- Валидация запросов/ответов
- Ограничение скорости и заголовки безопасности

### Соображения производительности

- Ленивая загрузка для экранов и компонентов
- Оптимизация и кеширование изображений
- Оптимизация запросов к базе данных
- Кеширование ответов API
- Оптимизация размера бандла

### Меры безопасности

- Санитизация и валидация входных данных
- Предотвращение SQL инъекций
- Защита от XSS
- Конфигурация CORS
- Реализация безопасных заголовков
- Защита переменных окружения

### Участие в разработке

1. Сделайте fork репозитория
2. Создайте ветку для функции
3. Реализуйте изменения с тестами
4. Убедитесь в соответствии стандартам качества кода
5. Отправьте pull request

### Лицензия

Этот проект лицензирован под лицензией 0BSD - см. файл LICENSE для деталей.

### Поддержка

Для технической поддержки или вопросов:
- Создайте issue в репозитории
- Свяжитесь с командой разработки
- Проверьте раздел FAQ в приложении

---

Построено с использованием современных технологий для надежного опыта бронирования рейсов.