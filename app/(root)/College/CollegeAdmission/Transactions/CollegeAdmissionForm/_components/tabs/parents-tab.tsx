'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Plus, Trash2, Mail } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function ParentsTab({ initialData, onNext, onBack }: { initialData: any, onNext: () => void, onBack: () => void }) {
    const { control, watch } = useFormContext();

    const fatherAlive = watch('AMCST_FatherAliveFlag');
    const motherAlive = watch('AMCST_MotherAliveFlag');

    const { fields: fatherMobileFields, append: appendFatherMobile, remove: removeFatherMobile } = useFieldArray({ control, name: "mobiles" });
    const { fields: fatherEmailFields, append: appendFatherEmail, remove: removeFatherEmail } = useFieldArray({ control, name: "emails" });

    const { fields: motherMobileFields, append: appendMotherMobile, remove: removeMotherMobile } = useFieldArray({ control, name: "mobiles1" });
    const { fields: motherEmailFields, append: appendMotherEmail, remove: removeMotherEmail } = useFieldArray({ control, name: "emails1" });

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="grid gap-8 p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Father Details */}
                    <div className="space-y-4">
                        <div className="bg-[#244b8a] text-white p-2 font-medium flex items-center gap-4">
                            <span>Father's Details</span>
                            <FormField control={control} name="AMCST_FatherAliveFlag" render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="father-alive" checked={field.value} onCheckedChange={field.onChange} className="bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-[#244b8a]" />
                                    <label htmlFor="father-alive" className="text-sm font-medium leading-none cursor-pointer">Alive</label>
                                </div>
                            )} />
                        </div>

                        <FormField control={control} name="AMCST_FatherName" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Father's Name: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherSurname" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Sur Name:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherAadharNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Aadhaar No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherEducation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Qualification:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherOfficeAdd" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-start gap-4"><FormLabel className="col-span-1 mt-3">Office Address:</FormLabel>
                            <FormControl className="col-span-2"><Textarea className="resize-none h-16" {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherOccupation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Occupation:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherDesignation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Designation:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherBankAccNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Bank Account No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherIFSCCode" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Bank IFSC Code:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherCasteCertNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Caste Certificate No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherNationality" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Nationality:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!fatherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allcountry?.map((c: any) => (<SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherReligion" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Father Religion:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!fatherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allReligion?.map((r: any) => (<SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherCaste" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Father Caste:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!fatherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allCaste?.map((c: any) => (<SelectItem key={c.imC_Id} value={c.imC_Id.toString()}>{c.imC_CasteName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_FatherSubCaste" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Father Sub Caste:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!fatherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-center gap-4">
                            <FormLabel className="col-span-1">Income:</FormLabel>
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                <FormField control={control} name="AMCST_FatherMIncome" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Monthly Income" {...field} disabled={!fatherAlive} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={control} name="AMCST_FatherIncome" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Annual Income" {...field} disabled={!fatherAlive} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Father Mobile Number Array */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 mt-3">Mobile Number:</FormLabel>
                            <div className="col-span-2 space-y-2">
                                {fatherMobileFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Select defaultValue="91" disabled={!fatherAlive}>
                                            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Select Country" /></SelectTrigger>
                                            <SelectContent><SelectItem value="91">91</SelectItem></SelectContent>
                                        </Select>
                                        <div className="flex-1 flex items-center border rounded-md px-2 bg-background has-[:disabled]:opacity-50">
                                            <span className="text-muted-foreground mr-2">📱</span>
                                            <FormField control={control} name={`mobiles.${index}.amcsT_FatherMobleNo`} render={({ field }) => (
                                                <FormItem className="flex-1 m-0 space-y-0"><FormControl><Input className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9" placeholder="Mobile number" {...field} disabled={!fatherAlive} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <Button type="button" variant="outline" size="icon" disabled={!fatherAlive} onClick={() => index === 0 ? appendFatherMobile({ acstpmN_CountryCode: '91', amcsT_FatherMobleNo: '' }) : removeFatherMobile(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Father Email Array */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 mt-3">Email-ID:</FormLabel>
                            <div className="col-span-2 space-y-2">
                                {fatherEmailFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <div className="flex-1 flex items-center border rounded-md px-3 bg-background has-[:disabled]:opacity-50">
                                            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                                            <FormField control={control} name={`emails.${index}.amcsT_FatheremailId`} render={({ field }) => (
                                                <FormItem className="flex-1 m-0 space-y-0"><FormControl><Input className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9" type="email" placeholder="" {...field} disabled={!fatherAlive} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <Button type="button" variant="outline" size="icon" disabled={!fatherAlive} onClick={() => index === 0 ? appendFatherEmail({ amcsT_FatheremailId: '' }) : removeFatherEmail(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mother Details */}
                    <div className="space-y-4">
                        <div className="bg-[#244b8a] text-white p-2 font-medium flex items-center gap-4">
                            <span>Mother's Details</span>
                            <FormField control={control} name="AMCST_MotherAliveFlag" render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="mother-alive" checked={field.value} onCheckedChange={field.onChange} className="bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-[#244b8a]" />
                                    <label htmlFor="mother-alive" className="text-sm font-medium leading-none cursor-pointer">Alive</label>
                                </div>
                            )} />
                        </div>

                        <FormField control={control} name="AMCST_MotherName" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Mother's Name: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherSurname" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Sur Name:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherAadharNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Aadhaar No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherEducation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Qualification:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherOfficeAdd" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-start gap-4"><FormLabel className="col-span-1 mt-3">Office Address:</FormLabel>
                            <FormControl className="col-span-2"><Textarea className="resize-none h-16" {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherOccupation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Occupation:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherDesignation" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Designation:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherBankAccNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Bank Account No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherIFSCCode" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Bank IFSC Code:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherCasteCertNo" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Caste Certificate No.:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherNationality" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Nationality:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!motherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allcountry?.map((c: any) => (<SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherReligion" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Mother Religion:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!motherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allReligion?.map((r: any) => (<SelectItem key={r.ivrmmR_Id} value={r.ivrmmR_Id.toString()}>{r.ivrmmR_Name}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherCaste" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Mother Caste:</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!motherAlive}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData?.allCaste?.map((c: any) => (<SelectItem key={c.imC_Id} value={c.imC_Id.toString()}>{c.imC_CasteName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_MotherSubCaste" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Mother Sub Caste:</FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={!motherAlive} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-center gap-4">
                            <FormLabel className="col-span-1">Income:</FormLabel>
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                <FormField control={control} name="AMCST_MotherMIncome" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Monthly Income" {...field} disabled={!motherAlive} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={control} name="AMCST_MotherIncome" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Annual Income" {...field} disabled={!motherAlive} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Mother Mobile Number Array */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 mt-3">Mobile Number:</FormLabel>
                            <div className="col-span-2 space-y-2">
                                {motherMobileFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Select defaultValue="91" disabled={!motherAlive}>
                                            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Select Country" /></SelectTrigger>
                                            <SelectContent><SelectItem value="91">91</SelectItem></SelectContent>
                                        </Select>
                                        <div className="flex-1 flex items-center border rounded-md px-2 bg-background has-[:disabled]:opacity-50">
                                            <span className="text-muted-foreground mr-2">📱</span>
                                            <FormField control={control} name={`mobiles1.${index}.amcsT_MotherMobleNo`} render={({ field }) => (
                                                <FormItem className="flex-1 m-0 space-y-0"><FormControl><Input className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9" placeholder="Mobile number" {...field} disabled={!motherAlive} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <Button type="button" variant="outline" size="icon" disabled={!motherAlive} onClick={() => index === 0 ? appendMotherMobile({ acstpmN_CountryCode: '91', amcsT_MotherMobleNo: '' }) : removeMotherMobile(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mother Email Array */}
                        <div className="grid grid-cols-3 items-start gap-4">
                            <FormLabel className="col-span-1 mt-3">Email-ID:</FormLabel>
                            <div className="col-span-2 space-y-2">
                                {motherEmailFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <div className="flex-1 flex items-center border rounded-md px-3 bg-background has-[:disabled]:opacity-50">
                                            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                                            <FormField control={control} name={`emails1.${index}.amcsT_MotheremailId`} render={({ field }) => (
                                                <FormItem className="flex-1 m-0 space-y-0"><FormControl><Input className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9" type="email" placeholder="" {...field} disabled={!motherAlive} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <Button type="button" variant="outline" size="icon" disabled={!motherAlive} onClick={() => index === 0 ? appendMotherEmail({ amcsT_MotheremailId: '' }) : removeMotherEmail(index)}>
                                            {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-center items-center gap-4 pt-8 pb-4">
                    <Button type="button" variant="outline" className="bg-[#244b8a] text-white hover:bg-[#1a3869] hover:text-white" onClick={onBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        PREVIOUS
                    </Button>
                    <Button type="button" onClick={onNext} className="bg-[#244b8a] hover:bg-[#1a3869]">
                        SAVE AND PROCEED
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" className="bg-[#f04a23] hover:bg-[#d03d1b]" onClick={() => window.location.reload()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        CLEAR ALL
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
