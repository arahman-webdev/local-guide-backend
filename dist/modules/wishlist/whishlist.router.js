"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whishlistRouter = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const enums_1 = require("../../generated/enums");
const wishlist_controlelr_1 = require("./wishlist.controlelr");
const router = express_1.default.Router();
router.post("/add", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), wishlist_controlelr_1.TourWishlitController.addToWishlist);
router.delete("/remove/:tourId", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), wishlist_controlelr_1.TourWishlitController.removeFromWishlist);
router.get("/my-wishlist", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), wishlist_controlelr_1.TourWishlitController.getWishlist);
exports.whishlistRouter = router;
