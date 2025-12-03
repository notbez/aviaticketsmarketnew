const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket';

async function fullDiagnosis() {
  console.log('🔍 ПОЛНАЯ ДИАГНОСТИКА СИСТЕМЫ');
  console.log('═══════════════════════════════════════\n');

  try {
    // 1. Проверка подключения к MongoDB
    console.log('1️⃣ Проверка подключения к MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Подключение успешно\n');

    // 2. Проверка пользователей
    console.log('2️⃣ Проверка пользователей в базе...');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({});
    console.log(`   Найдено пользователей: ${users.length}`);
    
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (ID: ${u._id.toString()})`);
    });
    console.log('');

    // 3. Проверка тестового пользователя
    console.log('3️⃣ Проверка тестового пользователя...');
    const testUser = await User.findOne({ email: 'test@test.com' });
    
    if (!testUser) {
      console.log('❌ Пользователь test@test.com НЕ НАЙДЕН');
      console.log('   Создаю пользователя...');
      
      const hash = await bcrypt.hash('123456', 10);
      const newUser = new User({
        fullName: 'Тестовый Пользователь',
        email: 'test@test.com',
        phone: '+79991234567',
        passwordHash: hash,
        passport: {
          passportNumber: '1234567890',
          country: 'RU',
          expiryDate: new Date('2030-12-31'),
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
        },
        consents: {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          notificationsAccepted: true,
          notificationsAcceptedAt: new Date(),
        },
        isActive: true,
      });
      
      await newUser.save();
      console.log('✅ Пользователь создан');
      console.log(`   ID: ${newUser._id.toString()}\n`);
    } else {
      console.log('✅ Пользователь найден');
      console.log(`   ID: ${testUser._id.toString()}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Имя: ${testUser.fullName}`);
      
      // Проверка пароля
      const passwordValid = await bcrypt.compare('123456', testUser.passwordHash);
      console.log(`   Пароль корректен: ${passwordValid ? '✅' : '❌'}\n`);
    }

    // 4. Проверка бронирований
    console.log('4️⃣ Проверка бронирований...');
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const bookings = await Booking.find({});
    console.log(`   Всего бронирований: ${bookings.length}`);
    
    if (bookings.length > 0) {
      bookings.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.from} → ${b.to} (User: ${b.user})`);
      });
    } else {
      console.log('   ⚠️  Бронирований нет в базе');
    }
    console.log('');

    // 5. Проверка бронирований для тестового пользователя
    if (testUser) {
      console.log('5️⃣ Бронирования тестового пользователя...');
      const userBookings = await Booking.find({ user: testUser._id });
      console.log(`   Найдено: ${userBookings.length}`);
      
      if (userBookings.length > 0) {
        userBookings.forEach((b, i) => {
          console.log(`   ${i + 1}. ${b.from} → ${b.to} (${b.flightNumber})`);
        });
      }
      console.log('');
    }

    // 6. Проверка коллекций
    console.log('6️⃣ Список коллекций в базе...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(c => {
      console.log(`   - ${c.name}`);
    });
    console.log('');

    await mongoose.disconnect();
    
    console.log('═══════════════════════════════════════');
    console.log('✅ ДИАГНОСТИКА ЗАВЕРШЕНА');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📋 ВЫВОДЫ:');
    console.log(`   - MongoDB подключена: ✅`);
    console.log(`   - Пользователей в базе: ${users.length}`);
    console.log(`   - Тестовый пользователь: ${testUser ? '✅' : '❌'}`);
    console.log(`   - Бронирований в базе: ${bookings.length}`);
    console.log('');
    
    if (!testUser) {
      console.log('⚠️  ПРОБЛЕМА: Тестовый пользователь не найден');
      console.log('   Решение: Пользователь создан автоматически');
    }
    
    if (bookings.length === 0) {
      console.log('⚠️  ПРОБЛЕМА: Бронирований нет в базе');
      console.log('   Причина: Бронирования не сохраняются или сохраняются в другую базу');
    }

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

fullDiagnosis();
