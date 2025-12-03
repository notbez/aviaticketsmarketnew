const jwt = require('jsonwebtoken');

const JWT_SECRET_OLD = '123456';
const JWT_SECRET_NEW = 'a7f3e9c2b8d4f1a6e5c9b3d7f2a8e4c1b9d5f3a7e2c8b4d1f6a9e3c7b2d8f4a1';
const USER_ID = '6930a7f7500ef1c618143a14';

console.log('🔐 ТЕСТ JWT ТОКЕНОВ');
console.log('═══════════════════════════════════════\n');

// Создаем токен со старым секретом
const tokenOld = jwt.sign(
  { sub: USER_ID, email: 'test@test.com' },
  JWT_SECRET_OLD,
  { expiresIn: '7d' }
);

// Создаем токен с новым секретом
const tokenNew = jwt.sign(
  { sub: USER_ID, email: 'test@test.com' },
  JWT_SECRET_NEW,
  { expiresIn: '7d' }
);

console.log('1️⃣ Токен со старым секретом (123456):');
console.log(`   ${tokenOld.substring(0, 80)}...`);
console.log('');

console.log('2️⃣ Токен с новым секретом:');
console.log(`   ${tokenNew.substring(0, 80)}...`);
console.log('');

// Проверяем валидацию
console.log('3️⃣ Проверка валидации:');

try {
  jwt.verify(tokenOld, JWT_SECRET_OLD);
  console.log('   ✅ Старый токен валиден со старым секретом');
} catch (e) {
  console.log('   ❌ Старый токен НЕ валиден со старым секретом');
}

try {
  jwt.verify(tokenOld, JWT_SECRET_NEW);
  console.log('   ✅ Старый токен валиден с новым секретом');
} catch (e) {
  console.log('   ❌ Старый токен НЕ валиден с новым секретом');
}

try {
  jwt.verify(tokenNew, JWT_SECRET_NEW);
  console.log('   ✅ Новый токен валиден с новым секретом');
} catch (e) {
  console.log('   ❌ Новый токен НЕ валиден с новым секретом');
}

try {
  jwt.verify(tokenNew, JWT_SECRET_OLD);
  console.log('   ✅ Новый токен валиден со старым секретом');
} catch (e) {
  console.log('   ❌ Новый токен НЕ валиден со старым секретом');
}

console.log('');
console.log('═══════════════════════════════════════');
console.log('📋 ВЫВОД:');
console.log('   Если сервер использует СТАРЫЙ секрет (123456),');
console.log('   а приложение получает токен с НОВЫМ секретом,');
console.log('   то будет ошибка "Invalid token"');
console.log('');
console.log('🔧 РЕШЕНИЕ:');
console.log('   На сервере Timeweb в .env должно быть:');
console.log(`   JWT_SECRET=${JWT_SECRET_NEW}`);
