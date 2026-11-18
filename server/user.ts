'use server';

import { ROLES } from '@/constants';
import { signIn } from '@/lib/auth';
import type { loginSchema } from '@/schemas/admission/preadmission/masters';
import { getUserByEmail } from '@/server/user-service';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import type { z } from 'zod';

interface LoginSceham {
    values: z.infer<typeof loginSchema>;
    callbackUrl?: string | null;
}

function getRoleHomeUrl(role?: string): string {
    const r = role?.toUpperCase();
    if (r === ROLES.ADMIN || r === ROLES.SUPER_ADMIN) {
        return '/school-admin';
    }
    if (r === ROLES.STUDENT) {
        return '/StudentPortal/student-dashboard';
    }
    if (r === ROLES.ONLINE_PREADMISSION_USER) {
        return '/admission/preadmission/dashboard';
    }
    if (r === ROLES.CHAIRMAN) {
        return '/chairman';
    }
    if (r === ROLES.STAFF || r === ROLES.GENERAL_STAFF || r === ROLES.HR_ADMIN) {
        return '/StaffPortal/staff-dashboard';
    }
    return '/';
}

export async function login({ values, callbackUrl }: LoginSceham) {
    try {
        const { email, password } = values;

        let targetUrl = callbackUrl && callbackUrl !== '/' && callbackUrl !== '/sign-in' ? callbackUrl : undefined;

        if (!targetUrl) {
            try {
                const userRes = await getUserByEmail(email, password);
                if (userRes?.success && userRes?.data) {
                    const role = userRes.data.role || userRes.data.roleName;
                    targetUrl = getRoleHomeUrl(role);
                }
            } catch (err) {
                console.warn('Could not determine role redirect ahead of time:', err);
            }
        }

        await signIn('credentials', {
            email,
            password,
            redirectTo: targetUrl || callbackUrl || '/school-admin',
            redirect: false
        });

        return { success: true, redirectTo: targetUrl || '/school-admin' };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: error.message || 'Invalid credentials!' };
                default:
                    return { error: error.message || 'Something went wrong!' };
            }
        }

        if ((error as any)?.message) {
            return { error: (error as any).message };
        }

        throw error;
    }
}

export async function forgotUsernameAction(mobileNo: string) {
    if (!mobileNo || mobileNo.trim().length === 0) {
        return { success: false, message: 'invalid register mobile number' };
    }

    const cleanMobile = mobileNo.trim();
    const baseUrl = process.env.NEXT_PUBLIC_PREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    try {
        if (baseUrl) {
            // As per user request, calling configuration/ForgotUserName
            const resPost = await fetch(`${baseUrl}/configuration/ForgotUserName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                // Assuming it might expect MobileNo in payload based on typical IVRM practices
                body: JSON.stringify({
                    MobileNo: cleanMobile,
                    mobileNo: cleanMobile,
                    Mobilenumber: cleanMobile,
                    AMST_MobileNo: Number(cleanMobile)
                }),
                cache: 'no-store'
            });

            if (resPost.ok) {
                const data = await resPost.json();

                // Based on user provided response format:
                // { "success": true, "message": "...", "data": "VVVSS2533" }
                if (data && data.success === true) {
                    if (data.data) {
                        return { success: true, username: String(data.data) };
                    }
                    if (data.username || data.userName || data.user_name) {
                        const uname = data.username || data.userName || data.user_name;
                        return { success: true, username: String(uname) };
                    }
                }
            } else {
                console.error('ForgotUserName API returned non-ok status:', resPost.status);
            }
        }
    } catch (err) {
        console.error('forgotUsernameAction POST error:', err);
    }

    try {
        if (baseUrl) {
            // Fallback GET request if POST is not the supported method
            const res = await fetch(`${baseUrl}/configuration/ForgotUserName/${cleanMobile}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.success === true) {
                    if (data.data) {
                        return { success: true, username: String(data.data) };
                    }
                }
            }
        }
    } catch (err) {
        console.error('forgotUsernameAction GET fallback error:', err);
    }

    return { success: false, message: 'invalid register mobile number' };
}
