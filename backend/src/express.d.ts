import 'express-session';
import type { SessionUser } from './types/session';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
    userId?: string;
    wsConnectionId?: string;
  }
}

declare module 'http' {
  interface IncomingMessage {
    session: import('express-session').Session &
      Partial<import('express-session').SessionData>;
  }
}
