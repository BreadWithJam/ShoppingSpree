"use strict";
/**
 * Main entry point for the AI Website Development Guide
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExampleClass = exports.RuleClass = exports.GuidelineEntryClass = void 0;
// Export types
__exportStar(require("./types"), exports);
// Export model classes with explicit naming to avoid conflicts
var GuidelineEntry_1 = require("./models/GuidelineEntry");
Object.defineProperty(exports, "GuidelineEntryClass", { enumerable: true, get: function () { return GuidelineEntry_1.GuidelineEntry; } });
var Rule_1 = require("./models/Rule");
Object.defineProperty(exports, "RuleClass", { enumerable: true, get: function () { return Rule_1.Rule; } });
var CodeExample_1 = require("./models/CodeExample");
Object.defineProperty(exports, "CodeExampleClass", { enumerable: true, get: function () { return CodeExample_1.CodeExample; } });
//# sourceMappingURL=index.js.map