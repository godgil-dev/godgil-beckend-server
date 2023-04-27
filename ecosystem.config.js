module.exports = {
  apps: [
    {
      name: 'imojumo',
      script: 'dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      // error_file: '/app/logs/error.log',
      // out_file: '/app/logs/out.log',
      // log_date_format: 'YYYY-MM-DD HH:mm:ss',
      wait_ready: true,
      listen_timeout: 50000,
      kill_timeout: 5000,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
