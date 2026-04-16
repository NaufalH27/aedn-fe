import { z } from "zod"

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string(),
})

const parsed = schema.parse(import.meta.env)

const env = {
  apiUrl: parsed.VITE_API_URL,
  appName: parsed.VITE_APP_NAME,
}
export default env
