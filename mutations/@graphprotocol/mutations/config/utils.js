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
const isPromise = (test) => typeof test.then === 'function';
const callFunc = (func) => __awaiter(void 0, void 0, void 0, function* () {
    let result = func();
    if (isPromise(result)) {
        result = yield result;
    }
    return result;
});
const initConfig = (properties, args, generators) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(generators);
    for (let key of keys) {
        if (typeof args === 'function') {
            args = yield callFunc(args);
        }
        const generator = generators[key];
        let arg = args[key];
        if (typeof generator === 'function') {
            if (typeof arg === 'function') {
                arg = yield callFunc(arg);
            }
            properties[key] = generator(arg);
        }
        else {
            properties[key] = {};
            initConfig(properties[key], args[key], generators[key]);
        }
    }
});
exports.createConfig = (args, generators) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {};
    yield initConfig(config, args, generators);
    return config;
});
exports.validateConfig = (args, generators) => {
    Object.keys(generators).forEach(key => {
        if (args[key] === undefined) {
            throw Error(`Failed to find mutation configuration value for the property ${key}.`);
        }
        if (typeof generators[key] === 'object') {
            if (typeof args[key] === 'function') {
                // we return here, as we can't validate at runtime that
                // the function will return the shape we're looking for
                return;
            }
            exports.validateConfig(args[key], generators[key]);
        }
    });
};
//# sourceMappingURL=utils.js.map