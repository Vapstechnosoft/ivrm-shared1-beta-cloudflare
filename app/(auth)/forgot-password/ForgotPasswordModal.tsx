'use client';

import { resetPasswordSubmit, sendForgotPasswordOTP, verifyForgotPasswordOTP } from '@/server/auth/forgot-password';
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User, X } from 'lucide-react';
import { useState } from 'react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialUsername?: string;
    mode?: 'username' | 'password';
}

export default function ForgotPasswordModal({ isOpen, onClose, initialUsername = '', mode = 'password' }: ForgotPasswordModalProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [username, setUsername] = useState(initialUsername);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setErrorMessage('Please enter your Username or Email address.');
            return;
        }
        setErrorMessage('');
        setIsLoading(true);
        try {
            const res = await sendForgotPasswordOTP({ username });
            if (res.success) {
                setSuccessMessage(res.message || 'OTP sent successfully!');
                setStep(2);
            } else {
                setErrorMessage(res.message || 'Failed to send OTP. Please try again.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim() || otp.length < 4) {
            setErrorMessage('Please enter a valid OTP code.');
            return;
        }
        setErrorMessage('');
        setIsLoading(true);
        try {
            const res = await verifyForgotPasswordOTP({ username, otp });
            if (res.success) {
                setSuccessMessage('OTP verified successfully! Set your new password.');
                setStep(3);
            } else {
                setErrorMessage(res.message || 'Invalid OTP code.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to verify OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) {
            setErrorMessage('Please enter a new password.');
            return;
        }
        if (newPassword.length < 8) {
            setErrorMessage('Minimum 8 characters required for Password.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);
        try {
            const res = await resetPasswordSubmit({ username, otp, newPassword });
            if (res.success) {
                setSuccessMessage(res.message || 'Password updated successfully!');
                setStep(4);
            } else {
                setErrorMessage(res.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModalClose = () => {
        setStep(1);
        setErrorMessage('');
        setSuccessMessage('');
        onClose();
    };

    return (
        <div className='forgot-modal-backdrop animate-fade-in'>
            <div className='forgot-modal-card glass-premium animate-scale-up'>
                {/* Close Button */}
                <button type='button' onClick={handleModalClose} className='forgot-modal-close-btn' aria-label='Close'>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className='forgot-modal-header'>
                    <div className='forgot-icon-badge'>
                        {mode === 'username' ? (
                            <User size={28} className='text-warm-orange' />
                        ) : (
                            <KeyRound size={28} className='text-warm-orange' />
                        )}
                    </div>
                    <h2 className='forgot-modal-title'>
                        {mode === 'username'
                            ? step === 1
                                ? 'Find Your Username'
                                : step === 2
                                  ? 'Enter Verification OTP'
                                  : step === 3
                                    ? 'Confirm Details'
                                    : 'Username Recovered'
                            : step === 1
                              ? 'Reset Your Password'
                              : step === 2
                                ? 'Enter Verification OTP'
                                : step === 3
                                  ? 'Create New Password'
                                  : 'Password Reset Complete'}
                    </h2>
                    <p className='forgot-modal-subtitle'>
                        {mode === 'username'
                            ? step === 1
                                ? 'Enter your registered Email address or Mobile number to retrieve your Username.'
                                : step === 2
                                  ? 'Enter the 6-digit OTP code sent to your registered contact details.'
                                  : step === 3
                                    ? 'Review and confirm your recovery request.'
                                    : 'Your username details have been dispatched to your registered contact.'
                            : step === 1
                              ? 'Enter your username or email address to receive a verification code.'
                              : step === 2
                                ? 'Enter the 6-digit OTP code sent to your registered contact details.'
                                : step === 3
                                  ? 'Enter and confirm your new secure password.'
                                  : 'Your password has been successfully updated.'}
                    </p>
                </div>

                {/* Progress Steps Indicator */}
                {step <= 3 && (
                    <div className='forgot-steps-indicator'>
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                    <div className='login-error-toast mt-2 mb-4'>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* STEP 1: Enter Username/Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className='exact-form-premium'>
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`floating-input ${username ? 'has-value' : ''}`}
                                    placeholder=' '
                                    id='forgot-username'
                                    required
                                />
                                <label htmlFor='forgot-username' className='floating-label'>
                                    Username / Email / Mobile
                                </label>
                                <div className='input-focus-glow' />
                                <User className='input-icon' size={18} />
                            </div>
                        </div>

                        <button type='submit' className='btn-premium-primary' disabled={isLoading}>
                            {isLoading ? (
                                <div className='loading-spinner'>
                                    <div className='dot' />
                                    <div className='dot' />
                                    <div className='dot' />
                                </div>
                            ) : (
                                <>
                                    <span>Send OTP Code</span>
                                    <ArrowRight size={18} className='btn-arrow' />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className='exact-form-premium'>
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className={`floating-input tracking-widest ${otp ? 'has-value' : ''}`}
                                    placeholder=' '
                                    id='forgot-otp'
                                    maxLength={6}
                                    required
                                />
                                <label htmlFor='forgot-otp' className='floating-label'>
                                    Enter 6-Digit OTP
                                </label>
                                <div className='input-focus-glow' />
                                <ShieldCheck className='input-icon' size={18} />
                            </div>
                        </div>

                        <div className='my-2 flex items-center justify-between px-1 text-sm'>
                            <button
                                type='button'
                                onClick={handleSendOtp}
                                className='cursor-pointer border-0 bg-transparent font-semibold text-warm-orange text-xs hover:underline'
                                disabled={isLoading}>
                                Resend OTP
                            </button>
                            <button
                                type='button'
                                onClick={() => setStep(1)}
                                className='cursor-pointer border-0 bg-transparent font-semibold text-gray-500 text-xs hover:underline'>
                                Change Username
                            </button>
                        </div>

                        <button type='submit' className='btn-premium-primary mt-4' disabled={isLoading}>
                            {isLoading ? (
                                <div className='loading-spinner'>
                                    <div className='dot' />
                                    <div className='dot' />
                                    <div className='dot' />
                                </div>
                            ) : (
                                <>
                                    <span>Verify OTP</span>
                                    <ArrowRight size={18} className='btn-arrow' />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 3: Enter New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className='exact-form-premium'>
                        <div className='floating-field mb-4'>
                            <div className='input-wrapper'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`floating-input ${newPassword ? 'has-value' : ''}`}
                                    placeholder=' '
                                    id='new-password'
                                    required
                                />
                                <label htmlFor='new-password' className='floating-label'>
                                    New Password
                                </label>
                                <div className='input-focus-glow' />
                                <Lock className='input-icon' size={18} />
                                <button type='button' onClick={() => setShowPassword(!showPassword)} className='password-toggle-btn'>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className='floating-field mb-4'>
                            <div className='input-wrapper'>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`floating-input ${confirmPassword ? 'has-value' : ''}`}
                                    placeholder=' '
                                    id='confirm-password'
                                    required
                                />
                                <label htmlFor='confirm-password' className='floating-label'>
                                    Confirm New Password
                                </label>
                                <div className='input-focus-glow' />
                                <Lock className='input-icon' size={18} />
                                <button
                                    type='button'
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className='password-toggle-btn'>
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type='submit' className='btn-premium-primary mt-4' disabled={isLoading}>
                            {isLoading ? (
                                <div className='loading-spinner'>
                                    <div className='dot' />
                                    <div className='dot' />
                                    <div className='dot' />
                                </div>
                            ) : (
                                <>
                                    <span>Reset Password</span>
                                    <ArrowRight size={18} className='btn-arrow' />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 4: Success Message */}
                {step === 4 && (
                    <div className='animate-fade-in py-6 text-center'>
                        <div className='mb-4 flex justify-center text-emerald-500'>
                            <CheckCircle2 size={64} />
                        </div>
                        <h3 className='mb-2 font-bold text-gray-800 text-xl'>Password Updated!</h3>
                        <p className='mb-6 text-gray-600 text-sm'>
                            Your password has been changed successfully. You can now log in using your new credentials.
                        </p>
                        <button type='button' onClick={handleModalClose} className='btn-premium-primary'>
                            <span>Back to Sign In</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
