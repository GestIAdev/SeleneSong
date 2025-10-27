// Test file to verify RedisCommandListener compilation
import { RedisCommandListener } from "./core/RedisCommandListener.js";


async function test() {
  console.log("Testing RedisCommandListener...");
  await RedisCommandListener.startRedisCommandListener();
}

test();

