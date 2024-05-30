import { createClient } from "redis";
import { Context } from "../context";

/**
 * Creates a Redis client and connects to the Redis server.
 * @returns The Redis client instance.
 */
const createRedisClient = () => {
  const redis = createClient({ url: `redis://${process.env.REDIS_HOST}` });

  redis.on("error", (err: any) => console.log("Redis Client Error", err));

  redis.connect();

  return redis;
};

/**
 * Resets the cache keys by deleting them from the Redis cache.
 * @param ctx The context object containing the Redis instance.
 * @param cacheKeys An array of cache keys to be deleted.
 */
const resetCacheKeys = async (ctx: Context, cacheKeys: string[]) => {
  await Promise.all(
    cacheKeys.map(async (key) => {
      await ctx.redis.del(key);
    })
  );
};

export { createRedisClient, resetCacheKeys };
