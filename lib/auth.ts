export const runtime = 'nodejs';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { loginSchema } from '@/schemas/admission/preadmission/masters';
import { getUserByEmail } from '@/server/user-service';
import NextAuth, { AuthError, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export class CustomAuthError extends AuthError {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.stack = undefined;
    }
}

// Detect if running locally / in development environment
const isLocalEnv =
    process.env.NODE_ENV !== 'production' ||
    process.env.AUTH_URL?.includes('localhost') ||
    process.env.AUTH_URL?.includes('127.0.0.1') ||
    (typeof process.argv !== 'undefined' &&
        process.argv.some((arg) => arg === 'dev' || arg.includes('turbopack') || arg.includes('next-dev')));

// In local development, normalize AUTH_URL if it was set to an external URL by an env file
if (isLocalEnv && process.env.AUTH_URL && !process.env.AUTH_URL.includes('localhost') && !process.env.AUTH_URL.includes('127.0.0.1')) {
    process.env.AUTH_URL = `http://localhost:${process.env.PORT || 3000}`;
}

export const authConfig: NextAuthConfig = {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/sign-in'
    },
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                try {
                    const { email, password } = await loginSchema.parseAsync(credentials);
                    const response = await getUserByEmail(email, password);

                    if (!response.success || !response.data) {
                        throw new CustomAuthError(response.message);
                    }

                    return {
                        ...response.data,
                        login_username: email
                    };
                } catch (error: any) {
                    throw new CustomAuthError(error.message);
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.mi_id = user.mi_id;
                token.user_id =
                    (user as any).user_id ||
                    (user as any).userId ||
                    (user as any).UserId ||
                    (user as any).id ||
                    (user as any).IVRMUL_Id ||
                    0;
                token.userId = token.user_id;
                const loginUsername = (user as any).login_username || '';
                const rawName = user.name || (user as any).username || (user as any).userName || (user as any).user_name || (user as any).user || (user as any).fullName || '';
                const isDefaultPlaceholder = !rawName || rawName.trim().toUpperCase() === 'DEFAULT USER' || rawName.trim().toUpperCase() === 'DEFAULTUSER';
                const cleanName = !isDefaultPlaceholder
                    ? rawName
                    : ((user as any).username || (user as any).userName || (user as any).user_name || loginUsername || user.email || '');

                token.name = cleanName;
                token.email = user.email || '';
                token.token = user.token || '';
                token.role = user.role || (user as any).roleName || '';
                token.roleId = user.roleId;

                const rawDesig = user.designation || (user as any).role || (user as any).roleName || '';
                const isDesigPlaceholder = !rawDesig || rawDesig.trim().toUpperCase() === 'ACTIVE USER' || rawDesig.trim().toUpperCase() === 'ACTIVEUSER';
                token.designation = isDesigPlaceholder ? (user.role || (user as any).roleName || '') : rawDesig;

                token.amst_id = user.amst_id;
                token.asmay_id =
                    user.asmay_id ||
                    (user as any).ASMAY_Id ||
                    (user as any).asmaY_Id ||
                    (user as any).ASMAY_ID ||
                    (user as any).asmaY_ID ||
                    0;
                token.hrme_id = user.hrme_id || (user as any).hrmE_Id || (user as any).HRME_Id || (user as any).HRME_ID || 0;
                token.mi_name =
                    user.mi_name ||
                    (user as any).mI_Name ||
                    (user as any).mi_Name ||
                    (user as any).MI_Name ||
                    (user as any).institution_name ||
                    '';
                token.username = (user as any).username || (user as any).userName || loginUsername || '';
                token.mi_logo =
                    user.mi_logo ||
                    (user as any).mI_logo ||
                    (user as any).mI_Logo ||
                    (user as any).mi_Logo ||
                    (user as any).MI_Logo ||
                    (user as any).MI_logo ||
                    (user as any).logoPath ||
                    (user as any).mI_LogoPath ||
                    (user as any).mI_Logo_Path ||
                    (user as any).logo ||
                    (user as any).institution_logo ||
                    (user as any).mI_Logo_Url ||
                    '';

                // Add token expiration logically based on backend response
                const u = user as any;
                const rawExpiresIn = u.expires_in ? Number(u.expires_in) : Number.NaN;
                const expiresIn = !Number.isNaN(rawExpiresIn) && rawExpiresIn > 0 ? rawExpiresIn : 86400; // Default to 24 hours if not provided or invalid
                token.expires_at = Math.round(Date.now() / 1000) + expiresIn;
            }
            if (trigger === 'update' && session) {
                token = { ...token, ...session };
            }

            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                //@ts-ignore
                session = { ...session, ...token };
            }
            return session;
        }
    },
    cookies: {
        sessionToken: {
            name: 'aivrm-session-1.0',
            options: {
                httpOnly: true,
                secure: !isLocalEnv && process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            }
        }
    }
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
