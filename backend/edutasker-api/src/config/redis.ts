import { createClient } from "redis";
import { config } from "./env.js";

const redis = createClient({
  url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
  password: config.REDIS_PASSWORD,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
await redis.connect();

export default redis;
