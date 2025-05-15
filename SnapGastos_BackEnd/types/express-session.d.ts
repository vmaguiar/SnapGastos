import "express-session";

declare module "express-session" {
  interface SessionData {
    user: {
      name: string;
      email: string;
      picture: string;
      spreadsheetId: string;
      sheetTitle: string;
      tokens: any; // você pode tipar melhor se quiser
    };
  }
}