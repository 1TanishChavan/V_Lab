"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class RedisClient {
  constructor() {
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.connectionAttempts = 0;
    this.MAX_RETRY_ATTEMPTS = 5;
    this.RETRY_DELAY = 5000;
    this.initializeClient();
    this.connect();
  }
  initializeClient() {
    this.client = (0, redis_1.createClient)({
      url: `rediss://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      socket: {
        connectTimeout: 10000,
        keepAlive: 0,
        noDelay: true,
        timeout: 30000,
      },
      pingInterval: -1,
    });
    this.client.on("error", (err) => {
      console.error("Redis client error:", err.message);
      this.handleConnectionError();
    });
    this.client.on("connect", () => {
      console.log("Redis client connecting...");
    });
    this.client.on("ready", () => {
      console.log("Redis client ready");
      this.connectionAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });
    this.client.on("end", () => {
      console.log("Redis connection ended");
      this.handleConnectionError();
    });
  }
  handleConnectionError() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.isConnecting || this.reconnectTimer) return;
      this.connectionAttempts++;
      if (this.connectionAttempts > this.MAX_RETRY_ATTEMPTS) {
        console.error("Max Redis connection attempts reached");
        return;
      }
      this.isConnecting = true;
      this.reconnectTimer = setTimeout(
        () =>
          __awaiter(this, void 0, void 0, function* () {
            try {
              console.log(
                `Attempting to reconnect to Redis (attempt ${this.connectionAttempts}/${this.MAX_RETRY_ATTEMPTS})...`
              );
              if (this.client.isOpen) {
                yield this.client.quit();
              }
              this.initializeClient();
              yield this.connect();
            } catch (error) {
              console.error("Redis reconnection failed:", error);
            } finally {
              this.isConnecting = false;
              this.reconnectTimer = null;
            }
          }),
        this.RETRY_DELAY
      );
    });
  }
  connect() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        yield this.client.connect();
      } catch (error) {
        console.error("Redis connection failed:", error);
        this.handleConnectionError();
      }
    });
  }
  get(key) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        return yield this.client.get(key);
      } catch (error) {
        console.error("Redis GET operation failed:", error);
        throw error;
      }
    });
  }
  set(key, value, options) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        yield this.client.set(key, value, options);
      } catch (error) {
        console.error("Redis SET operation failed:", error);
        throw error;
      }
    });
  }
  quit() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }
        if (this.client.isOpen) {
          yield this.client.quit();
        }
      } catch (error) {
        console.error("Error while closing Redis connection:", error);
      }
    });
  }
  isReady() {
    return this.client.isOpen;
  }
}
const redisClient = new RedisClient();
process.on("SIGTERM", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down Redis connection...");
    yield redisClient.quit();
    process.exit(0);
  })
);
process.on("SIGINT", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down Redis connection...");
    yield redisClient.quit();
    process.exit(0);
  })
);
exports.default = redisClient;
