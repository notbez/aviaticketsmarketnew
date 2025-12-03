const mongoose = require('mongoose');

async function checkAtlasData() {
  try {
    const mongoUri = 'mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket';
    console.log('Подключение к MongoDB Atlas...\n');
    
    await mongoose.connect(mongoUri);
    console.log('✓ Подключено к MongoDB Atlas\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    
    // Проверяем пользователей
    const users = await User.find({});
    console.log(`📊 Всего пользователей: ${users.length}\n`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   ID: ${u._id.toString()}`);
      console.log(`   Имя: ${u.fullName}`);
      console.log(`   Телефон: ${u.phone}\n`);
    });
    
    // Проверяем бронирования
    const bookings = await Booking.find({});
    console.log(`🎫 Всего бронирований: ${bookings.length}\n`);
    
    if (bookings.length > 0) {
      bookings.forEach((b, i) => {
        console.log(`${i + 1}. ${b.from} → ${b.to}`);
        console.log(`   User ID: ${b.user}`);
        console.log(`   Рейс: ${b.flightNumber}`);
        console.log(`   Цена: ${b.payment?.amount} ${b.payment?.currency}\n`);
      });
    }
    
    await mongoose.disconnect();
    console.log('✓ Отключено от MongoDB Atlas');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

checkAtlasData();
