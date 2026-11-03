// PM2 keeps the Node server running: it restarts it after a crash and when the server reboots.
// Start it from the project folder with: pm2 start deploy/ecosystem.config.cjs

const path = require('node:path')

module.exports = {
  apps: [
    {
      name: 'bullas',
      cwd: path.join(__dirname, '..', 'server'),
      script: 'src/server.js',
      // The same way npm run dev loads settings, so there's only one place to put secrets.
      node_args: '--env-file=.env',
      // One copy only: login rate limits are kept in memory and uploads are on this disk,
      // so several copies would each see only part of the picture.
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
