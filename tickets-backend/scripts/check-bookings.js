const mongoose = require('mongoose');
require('dotenv').config();

async function checkBookings() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tickets';
    await mongoose.connect(mongoUri);
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    
    const user = await User.findOne({ email: 'test@test.com' });
    if (!user) {
      console.log('❌ Пользователь не найден');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✓ Пользователь:', user.email, '(ID:', user._id.toString(), ')');
    
    const bookings = await Booking.find({ user: user._id }).sort({ createdAt: -1 });
    console.log(`\n✓ Найдено бронирований: ${bookings.length}\n`);
    
    bookings.forEach((b, i) => {
      console.log(`${i + 1}. ${b.from} → ${b.to}`);
      console.log(`   Рейс: ${b.flightNumber}`);
      console.log(`   Дата: ${b.departureDate}`);
      console.log(`   Цена: ${b.payment?.amount} ${b.payment?.currency}`);
      console.log(`   ID: ${b._id.toString()}\n`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

checkBookings();
