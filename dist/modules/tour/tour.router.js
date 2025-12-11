"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourRoutes = void 0;
const express_1 = __importDefault(require("express"));
// import { UserRole } from "@prisma/client"
const multer_config_1 = require("../../config/multer.config");
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const enums_1 = require("../../generated/enums");
const tour_controller_1 = require("./tour.controller");
const router = express_1.default.Router();
router.post("/", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE), multer_config_1.upload.array("images", 5), tour_controller_1.TourController.createTour);
router.get("/", tour_controller_1.TourController.getTour);
router.get("/my-tours", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE), tour_controller_1.TourController.getMyTours);
router.get("/:slug", tour_controller_1.TourController.getSingleTour);
router.delete("/:id", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), tour_controller_1.TourController.deleteTour);
router.patch("/toggle-status/:id", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), tour_controller_1.TourController.toggleTourStatus);
router.put("/:slug", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE), multer_config_1.upload.array("images", 5), tour_controller_1.TourController.updateTour);
exports.tourRoutes = router;
