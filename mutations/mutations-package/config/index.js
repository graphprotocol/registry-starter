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
const utils_1 = require("../utils");
const initConfig = (properties, args, generators) => __awaiter(void 0, void 0, void 0, function* () {
    // An argument can be a function that returns other arguments
    if (typeof args === 'function') {
        args = yield utils_1.execFunc(args);
    }
    const keys = Object.keys(generators);
    for (let key of keys) {
        const generator = generators[key];
        if (typeof generator === 'function') {
            let arg = args[key];
            if (typeof arg === 'function') {
                arg = yield utils_1.execFunc(arg);
            }
            properties[key] = yield utils_1.execFunc(generator, arg);
        }
        else {
            properties[key] = {};
            yield initConfig(properties[key], args[key], generators[key]);
        }
    }
});
exports.createConfig = (args, generators) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {};
    yield initConfig(config, args, generators);
    return config;
});
exports.validateConfig = (args, generators, depth = 0) => {
    const keys = Object.keys(generators);
    if (depth !== 0 && keys.length === 0) {
        throw Error('Config Generators must be a function, or an object that contains functions.');
    }
    keys.forEach(key => {
        if (args[key] === undefined) {
            throw Error(`Failed to find mutation configuration value for the property '${key}'.`);
        }
        const generator = generators[key];
        const generatorType = typeof generator;
        if (generatorType === 'object') {
            if (typeof args[key] === 'function') {
                // we return here, as we can't validate at runtime that
                // the function will return the shape we're looking for
                return;
            }
            exports.validateConfig(args[key], generators[key], depth + 1);
        }
        else if (generatorType === 'function') {
            if (generator.length !== 1) {
                throw Error('Config Generators must take 1 argument');
            }
        }
        else {
            throw Error(`Generator must be of type 'object' or 'function'`);
        }
    });
};
//# sourceMappingURL=index.js.map