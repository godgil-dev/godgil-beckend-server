import { Request } from 'express';

interface UserRequest extends Request {
  user?: {
    id: number;
    username: string;
    eamil: string;
    avatarUrl: string;
  };
  cookies: {
    refreshToken?: string;
  };
}

export default UserRequest;
