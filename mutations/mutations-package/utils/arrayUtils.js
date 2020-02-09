"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRepeatedUnique = (array) => {
    const map = {};
    const count = array.map((val) => {
        return map[val] = (typeof map[val] === 'undefined') ? 1 : map[val] + 1;
    });
    return array.map((val, index) => {
        return val + (map[val] != 1 ? '_' + count[index] : '');
    });
};
//# sourceMappingURL=arrayUtils.js.map