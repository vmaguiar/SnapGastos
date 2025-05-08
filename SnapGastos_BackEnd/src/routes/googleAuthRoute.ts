import { Router } from "express";
import { loginGoogle } from "../controllers/GoogleAuthController";

const router = Router();

router.get('/google', loginGoogle);

export default router;