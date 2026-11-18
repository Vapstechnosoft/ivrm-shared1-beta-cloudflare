'use client';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Save } from 'lucide-react';
import { Controller } from 'react-hook-form';

export default function ExamStandardForm({ control, watch, handleSubmit, onSubmit, reset, formState: { errors, isSubmitting } }: any) {
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* ============================================================= */}
                {/* ⭐ COLUMN 1: Radio Groups, Search Type, Fraction, Round-off, Color */}
                {/* ============================================================= */}
                <div className='space-y-4'>
                    {/* 🔹 Ranking Method */}
                    <Controller
                        name='ExmConfig_RankingMethod'
                        control={control}
                        render={({ field }) => (
                            <div className='flex justify-around rounded border p-2 bg-muted/20'>
                                {['Dense', 'Standard'].map((v) => (
                                    <label key={v} className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                        <input type='radio' value={v} checked={field.value === v} onChange={() => field.onChange(v)} />
                                        {v} Rank
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                    {errors.ExmConfig_RankingMethod && <p className='text-red-500 text-sm'>{errors.ExmConfig_RankingMethod.message}</p>}

                    {/* 🔹 Remarks */}
                    <Controller
                        name='ExmConfig_Remarks'
                        control={control}
                        render={({ field }) => (
                            <div className='flex justify-around rounded border p-2 bg-muted/20'>
                                <label className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                    <input type='radio' value='General' checked={field.value === 'General'} onChange={() => field.onChange('General')} />
                                    General Remarks
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                    <input type='radio' value='Studentwise' checked={field.value === 'Studentwise'} onChange={() => field.onChange('Studentwise')} />
                                    Student wise Remarks
                                </label>
                            </div>
                        )}
                    />
                    {errors.ExmConfig_Remarks && <p className='text-red-500 text-sm'>{errors.ExmConfig_Remarks.message}</p>}

                    {/* 🔹 Pass / Fail Condition */}
                    <Controller
                        name='ExmConfig_PassFailRankFlag'
                        control={control}
                        render={({ field }) => (
                            <div className='flex justify-around rounded border p-2 bg-muted/20'>
                                <label className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                    <input type='radio' value='0' checked={field.value === '0'} onChange={() => field.onChange('0')} />
                                    Less Than Minimum Marks
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                    <input type='radio' value='1' checked={field.value === '1'} onChange={() => field.onChange('1')} />
                                    Special Condition
                                </label>
                            </div>
                        )}
                    />
                    {errors.ExmConfig_PassFailRankFlag && (
                        <p className='text-red-500 text-sm'>{errors.ExmConfig_PassFailRankFlag.message}</p>
                    )}

                    {/* 🔹 Default Column Display */}
                    <Controller
                        name='ExmConfig_AdmNoRegNoRollNo_DefaultFlag'
                        control={control}
                        render={({ field }) => (
                            <div className='flex justify-around rounded border p-2 bg-muted/20'>
                                {[
                                    { value: 'Admno', label: 'Admno' },
                                    { value: 'Regno', label: 'Regno' },
                                    { value: 'Rollno', label: 'Rollno' }
                                ].map(({ value, label }) => (
                                    <label key={value} className='flex items-center gap-2 cursor-pointer font-medium text-sm'>
                                        <input type='radio' checked={field.value === value} onChange={() => field.onChange(value)} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                    {errors.ExmConfig_AdmNoRegNoRollNo_DefaultFlag && (
                        <p className='text-red-500 text-sm'>{errors.ExmConfig_AdmNoRegNoRollNo_DefaultFlag.message}</p>
                    )}

                    {/* 🔹 Search Type */}
                    <div>
                        <label className='block text-xs font-semibold mb-1 text-muted-foreground'>Records Search Type</label>
                        <Controller
                            name='ExmConfig_Recordsearchtype'
                            control={control}
                            render={({ field }) => (
                                <select {...field} className='w-full rounded border p-2 text-sm bg-background'>
                                    <option value=''>--SELECT SEARCH--</option>
                                    <option value='Name'>Name</option>
                                    <option value='AdmNo'>Admission No</option>
                                    <option value='RollNo'>Roll No</option>
                                    <option value='RegNo'>Reg No</option>
                                </select>
                            )}
                        />
                        {errors.ExmConfig_Recordsearchtype && (
                            <p className='text-red-500 text-sm mt-1'>{errors.ExmConfig_Recordsearchtype.message}</p>
                        )}
                    </div>

                    {/* 🔹 Fraction Flag */}
                    <Controller
                        name='ExmConfig_EnableFractionFlg'
                        control={control}
                        render={({ field }) => (
                            <label className='flex items-center gap-2 cursor-pointer font-medium text-sm p-2 rounded border bg-muted/20'>
                                <input type='checkbox' checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                Fraction Flag
                            </label>
                        )}
                    />

                    {/* 🔹 Round-Off Flag */}
                    <Controller
                        name='ExmConfig_RoundoffFlag'
                        control={control}
                        render={({ field }) => (
                            <label className='flex items-center gap-2 cursor-pointer font-medium text-sm p-2 rounded border bg-muted/20'>
                                <input type='checkbox' checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                Round-Off Flag
                            </label>
                        )}
                    />

                    {/* 🔹 Apply Color For Fail */}
                    <InputText
                        label='Apply Color For Fail'
                        name='ExmConfig_FailColorFlg'
                        control={control}
                        {...control.register('ExmConfig_FailColorFlg')}
                        type='text'
                        placeholder='Enter Color for Fail'
                    />
                </div>

                {/* ============================================================= */}
                {/* ⭐ COLUMN 2: BRD Checkbox Configurations */}
                {/* ============================================================= */}
                <div className='space-y-3'>
                    {[
                        ['ExmConfig_PromotionFlag', 'Promotion Flag'],
                        ['ExmConfig_GraceAplFlg', 'Grace Flag'],
                        ['ExmConfig_BonusAplFlag', 'Bonus Flag'],
                        ['ExmConfig_MinAttAplFlag', 'Min. Attendance Flag'],
                        ['ExmConfig_MarksMultiply', 'Marks Multiply Flag'],
                        ['ExmConfig_PerRoundoffFlag', 'Percentage Round Off Flag'],
                        ['ExmConfig_GroupMarksToResultFlg', 'Group Marks To Result Flag'],
                        ['ExmConfig_EntryDateRestFlg', 'Entry Date Rest Flag'],
                        ['ExmConfig_AdmnoColumnDisplay', 'Adm.No Column Display'],
                        ['ExmConfig_RegnoColumnDisplay', 'Reg.No Column Display'],
                        ['ExmConfig_RollnoColumnDisplay', 'RollNo Column Display'],
                        ['ExmConfig_SecRankFlg', 'Section Rank Required']
                    ].map(([name, label]) => (
                        <Controller
                            key={name}
                            name={name as any}
                            control={control}
                            render={({ field }) => (
                                <label className='flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary transition-colors'>
                                    <input type='checkbox' checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                    {label}
                                </label>
                            )}
                        />
                    ))}
                </div>

                {/* ============================================================= */}
                {/* ⭐ COLUMN 3: BRD Checkbox Configurations */}
                {/* ============================================================= */}
                <div className='space-y-3'>
                    {[
                        ['ExmConfig_SectionPositionFlg', 'Section Position Required'],
                        ['ExmConfig_FailBoldFlg', 'Apply Bold For Fail'],
                        ['ExmConfig_FailItalicFlg', 'Apply Italic For Fail'],
                        ['ExmConfig_FailUnderscoreFlg', 'Apply Underline For Fail'],
                        ['ExmConfig_ClassRankFlg', 'Class Rank Required'],
                        ['ExmConfig_ClassPositionFlg', 'Class Position Required'],
                        ['ExmConfig_FailRankFlg', 'Rank Required For Fail'],
                        ['ExmConfig_HallTicketFlg', 'Class Wise Hallticket No Flag'],
                        ['ExmConfig_AllSubjectAbsentFlg', 'All Subject Absent Flag'],
                        ['ExmConfig_GroupwiseMarksFlg', 'Group Wise Mark']
                    ].map(([name, label]) => (
                        <Controller
                            key={name}
                            name={name as any}
                            control={control}
                            render={({ field }) => (
                                <label className='flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary transition-colors'>
                                    <input type='checkbox' checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                    {label}
                                </label>
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* ============================================================= */}
            {/* ⭐ SUBMIT & RESET BUTTONS */}
            {/* ============================================================= */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:col-span-2'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save Exam Standard
                    </div>
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                    onClick={() => reset()}
                    disabled={isSubmitting}>
                    Reset
                </Button>
            </div>
        </form>
    );
}
