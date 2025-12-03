const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

async function seedUser() {
  try {
    const mongoUri = 'mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket';
    console.log('Подключение к MongoDB Atlas...');
    
    await mongoose.connect(mongoUri);
    console.log('✓ Подключено к MongoDB Atlas');

    const User = mongoose.model('User', userSchema);
    const testEmail = 'test@test.com';
    const testPassword = '123456';

    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('⚠ Пользователь уже существует');
      console.log('\n📧 Email:', testEmail);
      console.log('🔑 Пароль:', testPassword);
      console.log('🆔 ID:', existingUser._id.toString());
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
    console.log('✓ Тестовый пользователь создан в MongoDB Atlas!');
    console.log('\n=================================');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Пароль:', testPassword);
    console.log('🆔 ID:', testUser._id.toString());
    console.log('=================================\n');

    await mongoose.disconnect();
    console.log('✓ Отключено от MongoDB Atlas');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

seedUser();
