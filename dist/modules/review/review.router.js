"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const enums_1 = require("../../generated/enums");
const router = express_1.default.Router();
router.post("/:id", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), review_controller_1.ReviewController.createReview);
router.get("/:tourId", review_controller_1.ReviewController.getTourReviews);
exports.reviewRoutes = router;
