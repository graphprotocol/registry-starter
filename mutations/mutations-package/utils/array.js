"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRepeatedUnique = (array) => {
    const map = {};
    const count = array.map((val) => map[val] = (typeof map[val] === 'undefined') ? 1 : map[val] + 1);
    return array.map((val, index) => val + (map[val] != 1 ? '_' + count[index] : ''));
};
//# sourceMappingURL=array.js.map