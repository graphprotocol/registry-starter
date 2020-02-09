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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
class StateUpdater {
    constructor(uuid, ext, subscriber) {
        this._ext = ext;
        this._sub = subscriber;
        this._state = Object.assign(Object.assign({ events: [] }, core_1.coreStateBuilder.getInitialState(uuid)), (this._ext ? this._ext.getInitialState(uuid) : {}));
        // Publish the initial state
        this.publish();
    }
    get current() {
        return lodash_1.cloneDeep(this._state);
    }
    dispatch(eventName, payload) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                name: eventName,
                payload
            };
            // Append the event
            this._state.events.push(event);
            // Call all relevant reducers
            const coreReducers = core_1.coreStateBuilder.reducers;
            const coreReducer = core_1.coreStateBuilder.reducer;
            const extReducers = (_a = this._ext) === null || _a === void 0 ? void 0 : _a.reducers;
            const extReducer = (_b = this._ext) === null || _b === void 0 ? void 0 : _b.reducer;
            if (coreReducers && coreReducers[event.name] !== undefined) {
                const coreStatePartial = yield utils_1.execFunc(coreReducers[event.name], lodash_1.cloneDeep(this._state), payload);
                this._state = lodash_1.merge(this._state, coreStatePartial);
            }
            else if (coreReducer) {
                const coreStatePartial = yield utils_1.execFunc(coreReducer, lodash_1.cloneDeep(this._state), event);
                this._state = lodash_1.merge(this._state, coreStatePartial);
            }
            if (extReducers && extReducers[event.name] !== undefined) {
                const extStatePartial = yield utils_1.execFunc(extReducers[event.name], lodash_1.cloneDeep(this._state), payload);
                this._state = lodash_1.merge(this._state, extStatePartial);
            }
            else if (extReducer) {
                const extStatePartial = yield utils_1.execFunc(extReducer, lodash_1.cloneDeep(this._state), event);
                this._state = lodash_1.merge(this._state, extStatePartial);
            }
            // Publish the latest state
            this.publish();
        });
    }
    publish() {
        if (this._sub) {
            this._sub.next(lodash_1.cloneDeep(this._state));
        }
    }
}
exports.StateUpdater = StateUpdater;
__export(require("./core"));
__export(require("./types"));
//# sourceMappingURL=index.js.map