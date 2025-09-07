// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id?: string;
    role?: string;
  }
  interface Session {
    accessToken?: string;
    user?: User;
  }
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}