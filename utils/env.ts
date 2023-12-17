import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts"

const env = async(name: string) => {
  const env = await load();
  return env[name]
}

export default env
