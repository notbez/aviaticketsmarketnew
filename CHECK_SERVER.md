# 🔍 ПРОВЕРКА СЕРВЕРА

## Проблема подтверждена:
✅ Авторизация работает (токен создается)
❌ Проверка токена не работает (401 Invalid token)

Это значит JWT_SECRET **разный** при создании и проверке токена!

## Возможные причины:

### 1. На сервере несколько .env файлов
```bash
ssh root@193.233.103.8
cd ~/aviatickets-backend/tickets-backend

# Проверьте все .env файлы
ls -la | grep env
cat .env
cat .env.production 2>/dev/null
cat .env.local 2>/dev/null
```

### 2. PM2 использует старый .env
```bash
# Остановите PM2
pm2 stop aviatickets-backend
pm2 delete aviatickets-backend

# Запустите заново
cd ~/aviatickets-backend/tickets-backend
pm2 start npm --name "aviatickets-backend" -- run start:prod

# Проверьте
pm2 logs aviatickets-backend --lines 30
```

### 3. Проверьте JWT_SECRET на сервере
```bash
ssh root@193.233.103.8
cd ~/aviatickets-backend/tickets-backend
cat .env | grep JWT_SECRET
```

Должно быть ТОЧНО:
```
JWT_SECRET=a7f3e9c2b8d4f1a6e5c9b3d7f2a8e4c1b9d5f3a7e2c8b4d1f6a9e3c7b2d8f4a1
```

### 4. Проверьте, что сервер читает правильный .env
```bash
# На сервере
cd ~/aviatickets-backend/tickets-backend
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET.substring(0, 50) + '...');"
```

## Тест после исправления:

На вашем компьютере запустите:
```bash
cd tickets-backend
bash scripts/test-server.sh
```

Должно быть:
✅ Авторизация работает
✅ Профиль загружен успешно
✅ Эндпоинт /booking работает

## Если всё равно 401:

Значит проблема в коде. Проверьте на сервере:
```bash
cd ~/aviatickets-backend/tickets-backend/src/auth
cat jwt.strategy.ts
```

Должно быть:
```typescript
constructor(private configService: ConfigService) {
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: configService.get<string>('JWT_SECRET'),
  });
}
```

## Быстрое решение:

Если ничего не помогает, используйте простой JWT_SECRET:
```bash
# На сервере
cd ~/aviatickets-backend/tickets-backend
nano .env

# Измените на:
JWT_SECRET=123456

# Перезапустите
pm2 restart aviatickets-backend
```

Затем в локальном .env тоже:
```
JWT_SECRET=123456
```

Это небезопасно для production, но для тестирования подойдет.
