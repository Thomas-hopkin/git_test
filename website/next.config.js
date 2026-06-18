/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GAME_API_URL: process.env.GAME_API_URL ?? 'http://localhost:8080',
  },
}

module.exports = nextConfig
