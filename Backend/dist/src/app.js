"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const departmentRoutes_1 = __importDefault(require("./routes/departmentRoutes"));
const batchRoutes_1 = __importDefault(require("./routes/batchRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const practicalRoutes_1 = __importDefault(require("./routes/practicalRoutes"));
const batchPracticalAccessRoutes_1 = __importDefault(require("./routes/batchPracticalAccessRoutes"));
const facultyRoutes_1 = __importDefault(require("./routes/facultyRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const programmingLanguageRoutes_1 = __importDefault(require("./routes/programmingLanguageRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const courseFacultyRoutes_1 = __importDefault(require("./routes/courseFacultyRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        message: "Working as expected🦄🌈✨👋🌎🌍🌏✨🌈🦄",
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/departments', departmentRoutes_1.default);
app.use('/api/batches', batchRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/practicals', practicalRoutes_1.default);
app.use('/api/batch-practical-access', batchPracticalAccessRoutes_1.default);
app.use('/api/faculty', facultyRoutes_1.default);
app.use('/api/students', studentRoutes_1.default);
app.use('/api/programming-languages', programmingLanguageRoutes_1.default);
app.use('/api/course-faculty', courseFacultyRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
