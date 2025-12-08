module.exports = {
  apps: [
    {
      name: 'aviatickets-backend',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,

        // 🔥 Важные переменные окружения
        JWT_SECRET: 'a7f3e9c2b8d4f1a6e5c9b3d7f2a8e4c1b9d5f3a7e2c8b4d1f6a9e3c7b2d8f4a1',
        MONGO_URI: 'mongodb+srv://Misha110208:Misha110208@aviamarket.7o9kplj.mongodb.net/tickets?retryWrites=true&w=majority&appName=aviamarket',

        ONELYA_BASE_URL: 'https://api-test.onelya.ru/',
        ONELYA_LOGIN: 'trevel_test',
        ONELYA_PASSWORD: '5mPaN5KyB!27LN!',
        ONELYA_POS: 'trevel_test',
      },

      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};