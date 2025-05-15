import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticação ausente" });
    return;
  }

  const jwtToken = authHeader.split(" ")[1];

  try {
    const jwtDecoded = jwt.verify(jwtToken, process.env.JWT_SECRET!) as { email: string };
    const userSession = req.session.user;

    if (!userSession || userSession.email !== jwtDecoded.email) {
      res.status(403).json({ error: "Token inválido ou expirado" });
      return;
    }

    req.user = userSession;
    return next();
  }
  catch (err) {
    res.status(403).json({ error: "Token inválido" });
    return;
  }
};