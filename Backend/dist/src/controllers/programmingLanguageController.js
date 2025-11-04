"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getProgrammingLanguages = getProgrammingLanguages;
exports.createProgrammingLanguage = createProgrammingLanguage;
exports.updateProgrammingLanguage = updateProgrammingLanguage;
exports.deleteProgrammingLanguage = deleteProgrammingLanguage;
const programmingLanguageService = __importStar(require("./../services/programmingLanguageService"));
const errors_1 = require("./../../src/utils/errors");
function getProgrammingLanguages(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const languages = yield programmingLanguageService.getProgrammingLanguages();
            res.json(languages);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function createProgrammingLanguage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const language = yield programmingLanguageService.createProgrammingLanguage(req.body);
            res.status(201).json(language);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function updateProgrammingLanguage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const language = yield programmingLanguageService.updateProgrammingLanguage(parseInt(req.params.id), req.body);
            res.json(language);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function deleteProgrammingLanguage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield programmingLanguageService.deleteProgrammingLanguage(parseInt(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
