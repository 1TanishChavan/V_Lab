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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.roleMiddleware = roleMiddleware;
const jwtUtils_1 = require("../utils/jwtUtils");
const errors_1 = require("../utils/errors");
const userService_1 = require("./../services/userService");
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return next(new errors_1.AppError(401, 'No token provided'));
        }
        try {
            const decoded = (0, jwtUtils_1.verifyToken)(token);
            const user = yield (0, userService_1.getUserById)(decoded.id);
            if (!user) {
                return next(new errors_1.AppError(401, 'User not found'));
            }
            req.user = user;
            next();
        }
        catch (error) {
            next(new errors_1.AppError(401, 'Invalid token'));
        }
    });
}
function roleMiddleware(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.AppError(401, 'Authentication required'));
        }
        if (roles.includes(req.user.role)) {
            next();
        }
        else {
            next(new errors_1.AppError(403, 'Access denied'));
        }
    };
}
