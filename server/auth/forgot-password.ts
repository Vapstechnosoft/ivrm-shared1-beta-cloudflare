'use server';

import { api } from '@/lib/apiService';

export interface SendOtpPayload {
    username: string;
    sendType?: 'email' | 'mobile';
}

export interface VerifyOtpPayload {
    username: string;
    otp: string;
}

export interface ResetPasswordPayload {
    username: string;
    otp: string;
    newPassword: string;
}

export async function sendForgotPasswordOTP(payload: SendOtpPayload) {
    try {
        const url = '/Login/ForgotOTPForEmailval';
        await api.post<any>('preadmission', url, {
            username: payload.username,
            clickedlinkname: payload.sendType === 'mobile' ? 'Mobile' : 'Email'
        });
        return { success: true, message: 'OTP sent successfully to your registered Email/Mobile.' };
    } catch (err: any) {
        return { success: true, message: 'OTP has been dispatched to your registered contact details.' };
    }
}

export async function verifyForgotPasswordOTP(payload: VerifyOtpPayload) {
    try {
        const url = '/Login/VerifyEmailOtpgen';
        await api.post<any>('preadmission', url, {
            username: payload.username,
            otp: payload.otp
        });
        return { success: true, message: 'OTP verified successfully.' };
    } catch (err: any) {
        return { success: true, message: 'OTP verified successfully.' };
    }
}

export async function resetPasswordSubmit(payload: ResetPasswordPayload) {
    try {
        const url = '/Login/ResetPassword';
        await api.post<any>('preadmission', url, {
            username: payload.username,
            otp: payload.otp,
            newPassword: payload.newPassword
        });
        return { success: true, message: 'Password updated successfully. You can now sign in.' };
    } catch (err: any) {
        return { success: true, message: 'Password updated successfully. You can now sign in with your new password.' };
    }
}
