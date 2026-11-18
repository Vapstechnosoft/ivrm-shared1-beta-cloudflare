'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { IClgPreadmissionStudent, IClgPreadmissionStatusUpdate } from '@/types/college/transactions';
import { useSendStatusOTP, useVerifyStatusOTP, usePreadmissionStatusUpdate } from '@/hooks/college/useCollegeTransactions';
import { toast } from 'sonner';

interface OTPVerificationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    updatePayload: IClgPreadmissionStatusUpdate;
    selectedStudents: IClgPreadmissionStudent[];
}

export default function OTPVerificationModal({
    open,
    onClose,
    onSuccess,
    updatePayload,
    selectedStudents,
}: OTPVerificationModalProps) {
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const { mutateAsync: sendOTP, isPending: isSending } = useSendStatusOTP();
    const { mutateAsync: verifyOTP, isPending: isVerifying } = useVerifyStatusOTP();
    const { mutateAsync: updateStatus, isPending: isUpdating } = usePreadmissionStatusUpdate();

    const handleSendOTP = async () => {
        try {
            const res = await sendOTP({
                otptype: 'STATUS_UPDATE',
                sms: updatePayload.sms,
                email: updatePayload.email,
            });
            if (res?.data?.success !== false) {
                setOtpSent(true);
                toast.success('OTP sent successfully!');
            } else {
                toast.error(res?.data?.message || 'Failed to send OTP');
            }
        } catch {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyAndSave = async () => {
        if (!otp.trim()) {
            toast.error('Please enter the OTP');
            return;
        }
        try {
            const verifyRes = await verifyOTP({ forgetEmailOTP: otp });
            if (verifyRes?.data?.success !== false) {
                const saveRes = await updateStatus({ ...updatePayload, forgetEmailOTP: otp });
                if (saveRes?.data?.success !== false) {
                    toast.success('Status updated successfully!');
                    onSuccess();
                    onClose();
                } else {
                    toast.error(saveRes?.data?.message || 'Failed to update status');
                }
            } else {
                toast.error(verifyRes?.data?.message || 'Invalid OTP');
            }
        } catch {
            toast.error('Verification failed');
        }
    };

    const handleDirectSave = async () => {
        try {
            const saveRes = await updateStatus(updatePayload);
            if (saveRes?.data?.success !== false) {
                toast.success('Status updated successfully!');
                onSuccess();
                onClose();
            } else {
                toast.error(saveRes?.data?.message || 'Failed to update status');
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    const needsOTP = updatePayload.sms || updatePayload.email;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Preadmission Status</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selected Students Summary */}
                    <div className="border rounded-md p-3 bg-muted/30 space-y-1">
                        <p className="text-sm font-medium">Selected Students ({selectedStudents.length})</p>
                        <div className="max-h-28 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                            {selectedStudents.slice(0, 10).map((s) => (
                                <div key={s.pacA_Id}>{s.name} — {s.pacA_RegistrationNo}</div>
                            ))}
                            {selectedStudents.length > 10 && (
                                <div>...and {selectedStudents.length - 10} more</div>
                            )}
                        </div>
                    </div>

                    {needsOTP ? (
                        <>
                            {!otpSent ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        An OTP will be sent to verify before sending {updatePayload.email ? 'Email' : ''}{updatePayload.email && updatePayload.sms ? ' and ' : ''}{updatePayload.sms ? 'SMS' : ''} notifications.
                                    </p>
                                    <Button
                                        onClick={handleSendOTP}
                                        disabled={isSending}
                                        className="w-full gap-2"
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Send OTP
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckCircle2 className="h-4 w-4" />
                                        OTP sent! Enter it below to proceed.
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="otp-input">Enter OTP</Label>
                                        <Input
                                            id="otp-input"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP..."
                                            maxLength={8}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleVerifyAndSave}
                                            disabled={isVerifying || isUpdating}
                                            className="flex-1 gap-2"
                                        >
                                            {(isVerifying || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Verify & Update
                                        </Button>
                                        <Button variant="outline" onClick={handleSendOTP} disabled={isSending}>
                                            Resend
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Confirm status update for {selectedStudents.length} student(s)?
                            </p>
                            <Button
                                onClick={handleDirectSave}
                                disabled={isUpdating}
                                className="w-full gap-2"
                            >
                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                Confirm Update
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
