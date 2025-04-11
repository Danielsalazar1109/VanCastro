import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";

// Determine the base URL based on environment
const baseUrl = process.env.NODE_ENV === "production" 
  ? "https://vancastro.vercel.app" 
  : process.env.NEXTAUTH_URL || "http://localhost:3000";

const handler = NextAuth({
  debug: process.env.NODE_ENV !== "production", // Enable debug mode in development
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Connect to the database
          await connectToDatabase();

          // Find the user by email
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          // Check if the password is correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return the user object (excluding the password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user from Google data
            await User.create({
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              email: user.email,
              phone: '', // Google doesn't provide phone, will need to be updated later
              googleId: account?.providerAccountId,
              role: 'user',
            });
          } else if (!existingUser.googleId) {
            // Update existing user with Google ID
            existingUser.googleId = account?.providerAccountId;
            await existingUser.save();
          }
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === 'google') {
          try {
            await connectToDatabase();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role;
              token.firstName = dbUser.firstName;
              token.lastName = dbUser.lastName;
              token.phone = dbUser.phone || '';
            }
          } catch (error) {
            console.error("JWT callback error:", error);
          }
        } else {
          // For credentials provider
          token.id = user.id;
          token.role = user.role;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.phone = user.phone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
      }
      return session;
    },
    async redirect({ url, baseUrl: nextAuthBaseUrl }) {
      console.log('Redirect URL:', url);
      console.log('Original Base URL:', nextAuthBaseUrl);
      
      // Use the baseUrl defined at the top of the file for consistency
      const effectiveBaseUrl = baseUrl;
      
      console.log('Effective Base URL:', effectiveBaseUrl);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      
      try {
        // Check if this is a Google authentication callback
        if (url.includes('callback') && url.includes('google')) {
          console.log('Google auth callback detected, redirecting to session-redirect');
          return `${effectiveBaseUrl}/api/auth/session-redirect`;
        }
        
        // If the URL is the default callback URL, redirect based on path
        if (url.startsWith(baseUrl) || (process.env.NODE_ENV === "production" && url.startsWith(effectiveBaseUrl))) {
          // Extract path by removing the base URL
          const path = url.startsWith(baseUrl) 
            ? url.substring(baseUrl.length)
            : url.substring(effectiveBaseUrl.length);
          
          console.log('Extracted path:', path);
          
          // If coming from Google auth or redirected to root
          if (path === '/' || path.startsWith('/api/auth/callback/google')) {
            console.log('Root or Google callback path detected, redirecting to session-redirect');
            return `${effectiveBaseUrl}/api/auth/session-redirect`;
          }
        }
        
        // For all other cases, return the original URL
        return url;
      } catch (error) {
        console.error('Error in redirect callback:', error);
        // In case of error, redirect to the session-redirect endpoint
        return `${effectiveBaseUrl}/api/auth/session-redirect`;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };