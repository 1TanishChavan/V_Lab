"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
function errorHandler(err, req, res, next) {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred' });
}
