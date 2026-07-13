import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password harus diisi");
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          throw new Error("Email tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!isPasswordValid) {
          throw new Error("Kata sandi salah");
        }

        const headersList = await headers();
        const userAgent =
          headersList.get("user-agent") || "Perangkat Tidak Dikenal";
        const newSessionToken = randomUUID();

        const { data: activeSessions } = await supabase
          .from("user_sessions")
          .select("id, session_token")
          .eq("id_user", user.id_user)
          .order("last_active_at", { ascending: true });

        if (activeSessions && activeSessions.length >= 3) {
          const overLimitCount = activeSessions.length - 2;
          const sessionsToKick = activeSessions
            .slice(0, overLimitCount)
            .map((s) => s.session_token);

          await supabase
            .from("user_sessions")
            .delete()
            .in("session_token", sessionsToKick);
        }

        await supabase.from("user_sessions").insert({
          id_user: user.id_user,
          session_token: newSessionToken,
          device_info: userAgent,
        });

        return {
          id: user.id_user,
          email: user.email,
          role: user.role,
          sessionToken: newSessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionId = user.sessionToken;
      }

      if (token.sessionToken) {
        const { data: sessionData } = await supabase
          .from("active_sessions")
          .select("session_id")
          .eq("session_id", token.sessionId)
          .single();

        if (!sessionData) {
          return {} as JWT;
        }

        await supabase
          .from("user_sessions")
          .update({ last_active_at: new Date().toISOString() })
          .eq("session_token", token.sessionToken);
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) return {} as Session;

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, //! WAJIB ADA DI .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
