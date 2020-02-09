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
exports.coreStateBuilder = {
    getInitialState(uuid) {
        return {
            progress: 0,
            uuid
        };
    },
    reducers: {
        'PROGRESS_UPDATE': (state, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (payload.value < 0 || payload.value > 100 || !Number.isInteger(payload.value)) {
                throw new Error('Progress value must be an integer between 0 and 100');
            }
            return {
                progress: payload.value
            };
        })
    }
};
//# sourceMappingURL=core.js.map