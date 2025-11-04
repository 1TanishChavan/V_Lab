"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const errors_1 = require("../utils/errors");
const createRateLimiter = (options) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!userId) {
            return next(new errors_1.AppError(401, 'Unauthorized'));
        }
        const key = `${options.keyPrefix || 'ratelimit'}:${userId}`;
        try {
            const current = yield redis_1.default.get(key);
            if (current) {
                return next(new errors_1.AppError(429, 'Too many requests. Please try again later.'));
            }
            yield redis_1.default.set(key, '1', { EX: Math.floor(options.windowMs / 1000) });
            next();
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    });
};
exports.createRateLimiter = createRateLimiter;
