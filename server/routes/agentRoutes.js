import express from "express";
import { handleAgentMessage } from "../controllers/agentController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/agent", verifyJWT, handleAgentMessage);  // protected

export default router;