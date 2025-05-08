import { Request, Response } from "express";
import oauth2Client from "../services/googleAuthService";


export const loginGoogle = (_req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const redirectAuthURL = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code',
    scope: scopes,
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI as string
  });

  res.redirect(redirectAuthURL);
};