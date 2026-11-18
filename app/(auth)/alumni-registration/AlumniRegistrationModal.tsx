'use client';

import { registerAlumniRegistration } from '@/server/alumni/alumni-membership';
import { Ban, CheckCircle2, Eye, EyeOff, GraduationCap, Lock, Mail, Phone, User, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AlumniRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Generate Academic Years List
const academicYears = [
    { id: '1', year: '2010-2011' },
    { id: '2', year: '2011-2012' },
    { id: '3', year: '2012-2013' },
    { id: '4', year: '2013-2014' },
    { id: '5', year: '2014-2015' },
    { id: '6', year: '2015-2016' },
    { id: '7', year: '2016-2017' },
    { id: '8', year: '2017-2018' },
    { id: '9', year: '2018-2019' },
    { id: '10', year: '2019-2020' },
    { id: '11', year: '2020-2021' },
    { id: '12', year: '2021-2022' },
    { id: '13', year: '2022-2023' },
    { id: '14', year: '2023-2024' },
    { id: '15', year: '2024-2025' }
];

// Generate Classes List
const classList = [
    { id: '1', className: 'LKG' },
    { id: '2', className: 'UKG' },
    { id: '3', className: 'Class I' },
    { id: '4', className: 'Class II' },
    { id: '5', className: 'Class III' },
    { id: '6', className: 'Class IV' },
    { id: '7', className: 'Class V' },
    { id: '8', className: 'Class VI' },
    { id: '9', className: 'Class VII' },
    { id: '10', className: 'Class VIII' },
    { id: '11', className: 'Class IX' },
    { id: '12', className: 'Class X' },
    { id: '13', className: 'Class XI' },
    { id: '14', className: 'Class XII' }
];

export default function AlumniRegistrationModal({ isOpen, onClose }: AlumniRegistrationModalProps) {
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [admittedYear, setAdmittedYear] = useState('');
    const [leftYear, setLeftYear] = useState('');
    const [admittedClass, setAdmittedClass] = useState('');
    const [leftClass, setLeftClass] = useState('');
    const [admissionNumber, setAdmissionNumber] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation & Submit States
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // 1. Name
        if (!name.trim()) {
            newErrors.name = 'Enter AlumniName';
        }

        // 2. Email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email.trim()) {
            newErrors.email = 'Enter an Email';
        } else if (!emailPattern.test(email)) {
            newErrors.email = 'Please Enter Valid email id';
        }

        // 3. Mobile
        const mobilePattern = /^[6-9]{1}[0-9]{9}$/;
        if (!mobile.trim()) {
            newErrors.mobile = 'Enter Mobile Number';
        } else if (mobile.length !== 10) {
            newErrors.mobile = 'Mobile number must contain 10 digits';
        } else if (!mobilePattern.test(mobile)) {
            newErrors.mobile = 'Enter valid Mobile NO';
        }

        // 4. Admitted Year
        if (!admittedYear) {
            newErrors.admittedYear = 'Select Admitted Year';
        }

        // 5. Left Year
        if (!leftYear) {
            newErrors.leftYear = 'Select Left Year';
        }

        // 6. Admitted Class
        if (!admittedClass) {
            newErrors.admittedClass = 'Select Class';
        }

        // 7. Left Class
        if (!leftClass) {
            newErrors.leftClass = 'Select Left Class';
        }

        // 8. Username
        if (!username.trim()) {
            newErrors.username = 'Enter the User Name';
        }

        // 9. Password
        if (!password) {
            newErrors.password = 'Enter Password';
        } else if (/[\s&]/.test(password)) {
            newErrors.password = "Space and '&' Will not allowed in password";
        }

        // 10. Confirm Password
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please correct the validation errors in the form.');
            return;
        }

        setIsLoading(true);
        try {
            const selectedAdmittedYear = academicYears.find((y) => y.id === admittedYear)?.year || '';
            const selectedLeftYear = academicYears.find((y) => y.id === leftYear)?.year || '';
            const selectedAdmittedClass = classList.find((c) => c.id === admittedClass)?.className || '';
            const selectedLeftClass = classList.find((c) => c.id === leftClass)?.className || '';

            const payload = {
                Name: name,
                Email_id: email,
                Mobileno: mobile,
                admittedyer: Number(admittedYear) || 0,
                leftyear: Number(leftYear) || 0,
                classidadmitted: Number(admittedClass) || 0,
                leftclassid: Number(leftClass) || 0,
                Username: username,
                Password: password,
                Alumni: 'Alumni'
            };

            const response = await registerAlumniRegistration(payload);
            setIsSubmitted(true);
            toast.success('Alumni Registration submitted successfully!');
        } catch (err: any) {
            console.error('Alumni registration submit error:', err);
            const errorMessage = typeof err === 'string' ? err : err?.message || 'Failed to submit alumni registration.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setEmail('');
        setMobile('');
        setAdmittedYear('');
        setLeftYear('');
        setAdmittedClass('');
        setLeftClass('');
        setAdmissionNumber('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setIsSubmitted(false);
        onClose();
    };

    return (
        <div className='forgot-modal-backdrop animate-fade-in overflow-y-auto py-6'>
            <div className='forgot-modal-card glass-premium my-auto w-full max-w-xl animate-scale-up'>
                {/* Close Button */}
                <button type='button' onClick={handleClose} className='forgot-modal-close-btn' aria-label='Close'>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className='forgot-modal-header mb-4 border-b pb-3'>
                    <div className='forgot-icon-badge mb-2'>
                        <GraduationCap size={28} className='text-warm-orange' />
                    </div>
                    <h2 className='forgot-modal-title font-bold text-2xl'>Alumni Registration</h2>
                    <p className='forgot-modal-subtitle text-gray-500 text-xs'>
                        {isSubmitted
                            ? 'Thank you for connecting with your alma mater!'
                            : 'Fill in your details below to register as an official Alumni member.'}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className='exact-form-premium space-y-3' noValidate>
                        {/* 1. Name */}
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`floating-input ${name ? 'has-value' : ''} ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder=' '
                                    id='alumni-firstname'
                                    required
                                />
                                <label htmlFor='alumni-firstname' className='floating-label'>
                                    Name *
                                </label>
                                <div className='input-focus-glow' />
                                <User className='input-icon' size={18} />
                            </div>
                            {errors.name && <p className='field-error mt-1 text-red-600 text-xs'>{errors.name}</p>}
                        </div>

                        {/* 2. Email & Mobile */}
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <div className='floating-field'>
                                <div className='input-wrapper'>
                                    <input
                                        type='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`floating-input ${email ? 'has-value' : ''} ${errors.email ? 'is-invalid' : ''}`}
                                        placeholder=' '
                                        id='alumni-emailidd'
                                        required
                                    />
                                    <label htmlFor='alumni-emailidd' className='floating-label'>
                                        Email Id *
                                    </label>
                                    <div className='input-focus-glow' />
                                    <Mail className='input-icon' size={18} />
                                </div>
                                {errors.email && <p className='field-error mt-1 text-red-600 text-xs'>{errors.email}</p>}
                            </div>

                            <div className='floating-field'>
                                <div className='input-wrapper'>
                                    <input
                                        type='text'
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        className={`floating-input ${mobile ? 'has-value' : ''} ${errors.mobile ? 'is-invalid' : ''}`}
                                        placeholder=' '
                                        id='alumni-mobilenumber'
                                        required
                                    />
                                    <label htmlFor='alumni-mobilenumber' className='floating-label'>
                                        Mobile Number *
                                    </label>
                                    <div className='input-focus-glow' />
                                    <Phone className='input-icon' size={18} />
                                </div>
                                {errors.mobile && <p className='field-error mt-1 text-red-600 text-xs'>{errors.mobile}</p>}
                            </div>
                        </div>

                        {/* 3. Year of Admission & Year of Passing Out */}
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <div>
                                <select
                                    value={admittedYear}
                                    onChange={(e) => setAdmittedYear(e.target.value)}
                                    className={`h-12 w-full border bg-white/80 px-3 ${errors.admittedYear ? 'border-red-500' : 'border-gray-300'} rounded-xl font-medium text-sm focus:border-purple-500 focus:outline-none`}>
                                    <option value=''>Year of Admission *</option>
                                    {academicYears.map((yr) => (
                                        <option key={yr.id} value={yr.id}>
                                            {yr.year}
                                        </option>
                                    ))}
                                </select>
                                {errors.admittedYear && <p className='field-error mt-1 text-red-600 text-xs'>{errors.admittedYear}</p>}
                            </div>

                            <div>
                                <select
                                    value={leftYear}
                                    onChange={(e) => setLeftYear(e.target.value)}
                                    className={`h-12 w-full border bg-white/80 px-3 ${errors.leftYear ? 'border-red-500' : 'border-gray-300'} rounded-xl font-medium text-sm focus:border-purple-500 focus:outline-none`}>
                                    <option value=''>Year of Passing Out *</option>
                                    {academicYears.map((yr) => (
                                        <option key={yr.id} value={yr.id}>
                                            {yr.year}
                                        </option>
                                    ))}
                                </select>
                                {errors.leftYear && <p className='field-error mt-1 text-red-600 text-xs'>{errors.leftYear}</p>}
                            </div>
                        </div>

                        {/* 4. Class & Left Class */}
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <div>
                                <select
                                    value={admittedClass}
                                    onChange={(e) => setAdmittedClass(e.target.value)}
                                    className={`h-12 w-full border bg-white/80 px-3 ${errors.admittedClass ? 'border-red-500' : 'border-gray-300'} rounded-xl font-medium text-sm focus:border-purple-500 focus:outline-none`}>
                                    <option value=''>Class *</option>
                                    {classList.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.className}
                                        </option>
                                    ))}
                                </select>
                                {errors.admittedClass && <p className='field-error mt-1 text-red-600 text-xs'>{errors.admittedClass}</p>}
                            </div>

                            <div>
                                <select
                                    value={leftClass}
                                    onChange={(e) => setLeftClass(e.target.value)}
                                    className={`h-12 w-full border bg-white/80 px-3 ${errors.leftClass ? 'border-red-500' : 'border-gray-300'} rounded-xl font-medium text-sm focus:border-purple-500 focus:outline-none`}>
                                    <option value=''>Left Class *</option>
                                    {classList.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.className}
                                        </option>
                                    ))}
                                </select>
                                {errors.leftClass && <p className='field-error mt-1 text-red-600 text-xs'>{errors.leftClass}</p>}
                            </div>
                        </div>

                        {/* 5. Admission Number */}
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    value={admissionNumber}
                                    onChange={(e) => setAdmissionNumber(e.target.value)}
                                    className={`floating-input ${admissionNumber ? 'has-value' : ''}`}
                                    placeholder=' '
                                    id='alumni-admission'
                                />
                                <label htmlFor='alumni-admission' className='floating-label'>
                                    Enter Admission Number
                                </label>
                                <div className='input-focus-glow' />
                                <GraduationCap className='input-icon' size={18} />
                            </div>
                        </div>

                        {/* 6. Create Username */}
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type='text'
                                    maxLength={20}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`floating-input ${username ? 'has-value' : ''} ${errors.username ? 'is-invalid' : ''}`}
                                    placeholder=' '
                                    id='alumni-username'
                                    required
                                />
                                <label htmlFor='alumni-username' className='floating-label'>
                                    Create User Name *
                                </label>
                                <div className='input-focus-glow' />
                                <User className='input-icon' size={18} />
                            </div>
                            {errors.username && <p className='field-error mt-1 text-red-600 text-xs'>{errors.username}</p>}
                        </div>

                        {/* 7. New Password & Helper Hint */}
                        <div>
                            <div className='mb-1 flex items-center justify-between px-1'>
                                <span className='font-semibold text-blue-600 text-xs'>Ex: Password@123</span>
                            </div>
                            <div className='floating-field mb-1'>
                                <div className='input-wrapper'>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`floating-input ${password ? 'has-value' : ''} ${errors.password ? 'is-invalid' : ''}`}
                                        placeholder=' '
                                        id='alumni-password'
                                        required
                                    />
                                    <label htmlFor='alumni-password' className='floating-label'>
                                        Enter New Password *
                                    </label>
                                    <div className='input-focus-glow' />
                                    <Lock className='input-icon' size={18} />
                                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='password-toggle-btn'>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <p className='field-error mt-1 text-red-600 text-xs'>{errors.password}</p>}
                        </div>

                        {/* 8. Confirm Password */}
                        <div className='floating-field'>
                            <div className='input-wrapper'>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`floating-input ${confirmPassword ? 'has-value' : ''} ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    placeholder=' '
                                    id='alumni-confirmpassword'
                                    required
                                />
                                <label htmlFor='alumni-confirmpassword' className='floating-label'>
                                    Confirm Password *
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
                            {errors.confirmPassword && <p className='field-error mt-1 text-red-600 text-xs'>{errors.confirmPassword}</p>}
                        </div>

                        {/* 9. Buttons: Register (Green) & Cancel (Red) */}
                        <div className='grid grid-cols-2 gap-3 pt-3'>
                            <button
                                type='submit'
                                className='flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-md transition-all hover:bg-emerald-700'
                                disabled={isLoading}>
                                <UserPlus size={18} />
                                <span>{isLoading ? 'Registering...' : 'Register'}</span>
                            </button>

                            <button
                                type='button'
                                onClick={handleClose}
                                className='flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white shadow-md transition-all hover:bg-red-700'>
                                <Ban size={18} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className='animate-fade-in py-6 text-center'>
                        <div className='mb-4 flex justify-center text-emerald-500'>
                            <CheckCircle2 size={64} />
                        </div>
                        <h3 className='mb-2 font-bold text-gray-800 text-xl'>Registration Submitted!</h3>
                        <p className='mb-6 text-gray-600 text-sm'>Your Alumni Registration details have been received successfully.</p>
                        <button type='button' onClick={handleClose} className='btn-premium-primary'>
                            <span>Back to Sign In</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
