import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

// ローカル開発用のnodeサーバーを起動
const port = 8000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app