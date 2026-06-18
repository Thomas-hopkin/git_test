import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    GAME_API_URL: process.env.GAME_API_URL ?? 'http://localhost:8080',
  },
}

export default nextConfig
