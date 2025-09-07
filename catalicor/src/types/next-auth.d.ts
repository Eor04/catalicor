// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extiende el tipo de usuario predeterminado para incluir el ID y el rol.
   */
  interface User extends DefaultUser {
    id?: string;
    role?: string;
  }

  /**
   * Extiende el tipo de sesión predeterminado para incluir propiedades personalizadas.
   */
  interface Session {
    accessToken?: string;
    user?: User;
  }

  /**
   * Extiende el tipo de token JWT para incluir propiedades personalizadas.
   */
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}