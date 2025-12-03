const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  passwordHash: String,
}, { timestamps: true });

async function checkUser() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tickets';
    console.log('Подключение к MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✓ Подключено к MongoDB');

    const User = mongoose.model('User', userSchema);
    const user = await User.findOne({ email: 'test@test.com' });
    
    if (user) {
      console.log('\n✓ Пользователь найден:');
      console.log('ID:', user._id.toString());
      console.log('Email:', user.email);
      console.log('Имя:', user.fullName);
      console.log('Телефон:', user.phone);
    } else {
      console.log('\n❌ Пользователь test@test.com не найден');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

checkUser();
