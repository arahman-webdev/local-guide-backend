"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const enums_1 = require("../../generated/enums");
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
router.post("/initiate/:id", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), payment_controller_1.PaymentController.initiatePaymentController);
router.post("/success", payment_controller_1.PaymentController.sslSuccessHandler);
router.post("/fail", payment_controller_1.PaymentController.sslFailHandler);
router.post("/cancel", payment_controller_1.PaymentController.sslCancelHandler);
exports.paymentRoutes = router;
