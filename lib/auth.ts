import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt:        'select_account',
          access_type:   'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isValid) return null

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
          plan:  user.plan,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth — ensure user exists in DB with plan
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          if (existing && !existing.plan) {
            await prisma.user.update({
              where: { email: user.email! },
              data:  { plan: 'FREE' },
            })
          }
        } catch (err) {
          console.error('[SIGNIN ERROR]', err)
        }
      }
      return true
    },

    async jwt({ token, user, account, trigger }) {
      // On first sign in
      if (user) {
        token.id   = user.id
        token.plan = (user as any).plan ?? 'FREE'
      }
      // On Google OAuth sign in — fetch fresh data from DB
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { email: token.email },
            select: { id: true, plan: true },
          })
          if (dbUser) {
            token.id   = dbUser.id
            token.plan = dbUser.plan ?? 'FREE'
          }
        } catch (err) {
          console.error('[JWT ERROR]', err)
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id   = token.id   as string
        session.user.plan = token.plan as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
  // If it's an error page — still go to dashboard if user exists
  if (url.includes('/api/auth/error')) {
    return `${baseUrl}/login?error=OAuthError`
  }
  // After successful sign in always go to dashboard
  if (url === baseUrl || url === `${baseUrl}/`) {
    return `${baseUrl}/dashboard`
  }
  if (url.includes('/login') || url.includes('/register')) {
    return `${baseUrl}/dashboard`
  }
  if (url.startsWith('/')) return `${baseUrl}${url}`
  if (new URL(url).origin === baseUrl) return url
  return `${baseUrl}/dashboard`
},
  },
  events: {
    async createUser({ user }) {
      // When Google creates a new user — ensure plan is set
      try {
        await prisma.user.update({
          where: { id: user.id },
          data:  { plan: 'FREE', scansUsed: 0 },
        })
        console.log(`[NEW USER] ${user.email} created via OAuth`)
      } catch (err) {
        console.error('[CREATE USER ERROR]', err)
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}