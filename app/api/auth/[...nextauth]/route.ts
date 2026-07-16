import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { loginUserService } from "@/services/auth.service";

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

        const headersList = await headers();
        const userAgent =
          headersList.get("user-agent") || "Perangkat Tidak Dikenal";

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const result = await loginUserService(
          supabase,
          credentials.email,
          credentials.password,
          userAgent,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        if (!result.data) {
          throw new Error("Kredensial tidak valid");
        }

        return result.data;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionToken = user.sessionToken;
      }

      if (token.sessionToken) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const { data: sessionData } = await supabase
          .from("user_sessions")
          .select("session_token")
          .eq("session_token", token.sessionToken)
          .single();

        if (!sessionData) {
          token.error = "ForceLogout";
          return token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "ForceLogout") {
        session.error = "ForceLogout";
        session.user = {
          id: "",
          role: "",
          sessionToken: "",
          name: "",
          email: "",
          image: "",
        };
        return session;
      }

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
