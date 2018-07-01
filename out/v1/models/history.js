"use strict";
/*
 * Copyright (c) 2018 Scott Weiner
 * Licensed under AGPL V3.0.  See LICENSE file for details.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const rfc = __importStar(require("rfc6902"));
exports.HistorySchema = new mongoose_1.Schema({ log: String, patch: [mongoose_1.Schema.Types.Mixed] });
function create_patch(old_data, new_data) {
    let new_item;
    new_item = rfc.createPatch(new_data, old_data);
    if (new_item.length == 0) {
        return null;
    }
    return new_item;
}
exports.create_patch = create_patch;
exports.History = mongoose_1.model("History", exports.HistorySchema);
