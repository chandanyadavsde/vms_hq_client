module.exports = {
  apps: [{
    name: "vms-client-dev",
    script: "pm2-start.js",
    watch: false,
    env: {
      NODE_ENV: "development"
    }
  }]
};

