// backend/routes/admin.js
import express from "express";
import { listUsers, changeRole } from "../controllers/adminController.js";
const router = express.Router();

router.get("/users", listUsers);
router.put("/users/:id/role", changeRole);

export default router;
