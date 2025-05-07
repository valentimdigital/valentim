import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    cargo?: string;
    nivelAcesso?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      cargo?: string;
      nivelAcesso?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    cargo?: string;
    nivelAcesso?: string;
  }
}
