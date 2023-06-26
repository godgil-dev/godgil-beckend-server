export {};

declare global {
  namespace Express {
    export interface User {
      id: number;
      username: string;
      email: string;
      avatarUrl: string;
    }

    export interface GoogleUser {
      id: string;
      name: string;
      email: string;
      photos: string;
    }

    export interface Request {
      user?: User;
      googleUser?: GoogleUser;
      cookies: {
        refreshToken?: string;
      };
    }
  }
}
