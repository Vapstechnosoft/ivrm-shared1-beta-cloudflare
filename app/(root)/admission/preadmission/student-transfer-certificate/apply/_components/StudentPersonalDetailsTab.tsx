'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentPersonalDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
    disabled?: boolean;
}

export const StudentPersonalDetailsTab = ({ formData, setFormData, disabled }: StudentPersonalDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-500'>
            <div className='grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='dob' className='text-right font-semibold text-indigo-900'>
                            Date Of Birth :
                        </Label>
                        <Input id='dob' value={formData.dob || ''} className='bg-indigo-50/20' readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='dob_words' className='text-right font-semibold text-indigo-900'>
                            Date Of Birth in Words :
                        </Label>
                        <Input id='dob_words' value={formData.dob_words || ''} className='bg-indigo-50/20' readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='bank_ifsc' className='text-right font-semibold text-indigo-900'>
                            Student Bank IFSC Code:
                        </Label>
                        <Input id='bank_ifsc' value={formData.bank_ifsc || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='birth_place' className='text-right font-semibold text-indigo-900'>
                            Birth Place:
                        </Label>
                        <Input id='birth_place' value={formData.birth_place || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='birth_cert_no' className='text-right font-semibold text-indigo-900'>
                            Birth Certificate Number:
                        </Label>
                        <Input id='birth_cert_no' value={formData.birth_cert_no || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='caste_cert_no' className='text-right font-semibold text-indigo-900'>
                            Caste Certificate Number:
                        </Label>
                        <Input id='caste_cert_no' value={formData.caste_cert_no || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='age' className='text-right font-semibold text-indigo-900'>
                            Age:
                        </Label>
                        <Input id='age' value={formData.age || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='gender' className='text-right font-semibold text-indigo-900'>
                            Gender:
                        </Label>
                        <Input id='gender' value={formData.gender || ''} readOnly disabled={disabled} />
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='mother_tongue' className='text-right font-semibold text-indigo-900'>
                            Mother Tongue:
                        </Label>
                        <Input id='mother_tongue' value={formData.mother_tongue || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='nationality' className='text-right font-semibold text-indigo-900'>
                            Nationality:
                        </Label>
                        <Input id='nationality' value={formData.nationality || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='mobile' className='text-right font-semibold text-indigo-900'>
                            Mobile No. :
                        </Label>
                        <Input id='mobile' value={formData.mobile || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='email' className='text-right font-semibold text-indigo-900'>
                            Email ID:
                        </Label>
                        <Input id='email' value={formData.email || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='aadhar_no' className='text-right font-semibold text-indigo-900'>
                            Aadhar No. :
                        </Label>
                        <Input id='aadhar_no' value={formData.aadhar_no || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='blood_group' className='text-right font-semibold text-indigo-900'>
                            Blood Group :
                        </Label>
                        <Input id='blood_group' value={formData.blood_group || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='bank_ac_no' className='text-right font-semibold text-indigo-900'>
                            Student Bank A/C No. :
                        </Label>
                        <Input id='bank_ac_no' value={formData.bank_ac_no || ''} readOnly disabled={disabled} />
                    </div>

                    <div className='grid grid-cols-[180px_1fr] items-center gap-4'>
                        <Label htmlFor='bpl_card_no' className='text-right font-semibold text-indigo-900'>
                            BPL Card No. :
                        </Label>
                        <Input id='bpl_card_no' value={formData.bpl_card_no || ''} readOnly disabled={disabled} />
                    </div>
                </div>
            </div>
        </div>
    );
};
