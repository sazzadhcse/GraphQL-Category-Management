import { redis } from '../config/redis';

export async function getCache<T>(key:string) {
    const cachedData = await redis.get(key);
    if(!cachedData){
        return null;
    }
    return JSON.parse(cachedData) as T;
}

export async function setCache(key:string, value: unknown, ttl = 600) {
    await redis.set(key,JSON.stringify(value),'EX',ttl);
}

export async function deleteCacheKeys(keys: string[]) {
    if (keys.length === 0) {
        return;
    }
    await redis.del(...keys);
}
