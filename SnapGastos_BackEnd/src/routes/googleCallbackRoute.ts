import { Router } from "express";
import { googleCallback } from "../controllers/GoogleCallbackAuthController";

const router = Router();

router.get('/google/callback', googleCallback);

export default router;