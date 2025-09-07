// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions, type Account, type User, type Session, type JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app, db } from "@/utils/firebaseConfig"; 
import { doc, getDoc } from "firebase/firestore";

const auth = getAuth(app);

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;
          return {
            id: user.uid,
            email: user.email,
            name: user.email,
          };
        } catch (err) {
          console.error("Error signing in with credentials:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.id as string));
        if (userDoc.exists()) {
          token.role = userDoc.data()?.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Usamos el tipo `any` aquí solo para evitar el error de tipado estricto
      // ya que la firma de `session` es muy compleja. Los tipos de `next-auth.d.ts`
      // garantizan que el resultado sea seguro.
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };