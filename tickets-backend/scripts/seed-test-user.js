const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  passwordHash: String,
  passport: {
    passportNumber: String,
    country: String,
    expiryDate: Date,
  },
  notifications: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
  },
  consents: {
    termsAccepted: Boolean,
    termsAcceptedAt: Date,
    notificationsAccepted: Boolean,
    notificationsAcceptedAt: Date,
  },
  isActive: Boolean,
}, { timestamps: true });

async function seedTestUser() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tickets';
    console.log('Подключение к MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✓ Подключено к MongoDB');

    const User = mongoose.model('User', userSchema);

    const testEmail = 'test@test.com';
    const testPassword = '123456';

    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('⚠ Пользователь уже существует');
      console.log('\n📧 Email:', testEmail);
      console.log('🔑 Пароль:', testPassword);
      await mongoose.disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash(testPassword, 10);

    const testUser = new User({
      fullName: 'Тестовый Пользователь',
      email: testEmail,
      phone: '+79991234567',
      passwordHash: passwordHash,
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

    await testUser.save();
    console.log('✓ Тестовый пользователь создан!');
    console.log('\n=================================');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Пароль:', testPassword);
    console.log('=================================\n');

    await mongoose.disconnect();
    console.log('✓ Отключено от MongoDB');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

seedTestUser();
