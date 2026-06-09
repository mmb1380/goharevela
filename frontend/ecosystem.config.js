// PM2 ecosystem config — Goharevela Next.js
// usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'goharevela-frontend',
      cwd: '/var/www/goharevela/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://95.38.186.117/api',
        NEXT_PUBLIC_MEDIA_URL: 'http://95.38.186.117/media',
        PORT: 3000,
      },
      error_file: '/var/log/goharevela/pm2-error.log',
      out_file: '/var/log/goharevela/pm2-out.log',
      time: true,
    },
  ],
}
