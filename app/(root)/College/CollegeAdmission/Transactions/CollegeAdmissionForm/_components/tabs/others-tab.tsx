'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const REFERENCE_OPTIONS = ['FRIENDS', 'SOCIAL MEDIA', 'LECTURER', 'PROFESSOR', 'OWN REFERENCE', 'TELE CALLER'];
const SOURCE_OPTIONS = ['Social Media', 'Friends', 'College Faculty', 'Website', 'Home Visits', 'Handouts'];

export function OthersTab({ initialData, onNext, onBack }: { initialData: any, onNext: () => void, onBack: () => void }) {
    const { control, watch, setValue } = useFormContext();

    const refDetails = watch('referenceDetails') || [];
    const srcDetails = watch('sourceDetails') || [];

    const handleRefToggle = (val: string) => {
        const current = new Set(refDetails);
        if (current.has(val)) current.delete(val);
        else current.add(val);
        setValue('referenceDetails', Array.from(current));
    };

    const handleSrcToggle = (val: string) => {
        const current = new Set(srcDetails);
        if (current.has(val)) current.delete(val);
        else current.add(val);
        setValue('sourceDetails', Array.from(current));
    };

    const { fields: competitiveFields, append: appendComp, remove: removeComp } = useFieldArray({ control, name: "competitiveExams" });
    const { fields: subjectFields, append: appendSubj, remove: removeSubj } = useFieldArray({ control, name: "competitiveSubjects" });
    const { fields: siblingFields, append: appendSib, remove: removeSib } = useFieldArray({ control, name: "siblingsDetails" });

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="grid gap-6 p-0">

                {/* References */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 text-sm pt-2">Reference Details</div>
                        <div className="col-span-3 border p-2 h-40 overflow-y-auto bg-background">
                            {REFERENCE_OPTIONS.map(opt => (
                                <div key={opt} className="flex items-center space-x-2 py-1">
                                    <Checkbox checked={refDetails.includes(opt)} onCheckedChange={() => handleRefToggle(opt)} />
                                    <label className="text-sm cursor-pointer" onClick={() => handleRefToggle(opt)}>{opt}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 text-sm pt-2 text-right pr-4">Source Details</div>
                        <div className="col-span-3 border p-2 h-40 overflow-y-auto bg-background">
                            {SOURCE_OPTIONS.map(opt => (
                                <div key={opt} className="flex items-center space-x-2 py-1">
                                    <Checkbox checked={srcDetails.includes(opt)} onCheckedChange={() => handleSrcToggle(opt)} />
                                    <label className="text-sm cursor-pointer" onClick={() => handleSrcToggle(opt)}>{opt}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Previous Educational Details */}
                <div className="border border-muted">
                    <div className="text-center font-bold text-[#244b8a] p-2 bg-muted/20 border-b">
                        PREVIOUS EDUCATIONAL DETAILS
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_CollegeName" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">College Name</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_CourseName" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Course</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_TotalMarks" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Total Marks</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_Grade" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Grade</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_Board" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Board</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_Address" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Address</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_ExamPassed" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Exam Passed</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_RegNo" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Reg.No</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_BranchName" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Branch</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="science">Science</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_ObtainedMarks" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Obtained Marks</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_PreviousTCNo" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Previous TC No</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_CountryId" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Country</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allcountry?.map((c:any)=><SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_LeftReason" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Left Reason</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_MonthYearPassing" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Month & Year Of Passing</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-4">
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_CollegeType" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">College Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="puc">PUC</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_PassingYear" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Passing Year</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="2023">2023</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_Percentage" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Percentage</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_PreviousTCDate" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Previous TC Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl className="col-span-2"><Button variant="outline" className={cn("h-8 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span className="text-xs">Select date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_StateId" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">State</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Karnataka</SelectItem></SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_Medium" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Medium</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="prevSchoolDetails.0.amcsP_LanguageTaken" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Language Taken</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                        </div>
                    </div>
                    <div className="flex justify-end p-4 border-t">
                        <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-8 text-xs px-6"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                </div>

                {/* COMPETITIVE EXAM STUDENT DETAILS */}
                <div>
                    <h4 className="font-bold text-[#244b8a] text-sm mb-2">COMPETITIVE EXAM STUDENT DETAILS</h4>
                    <div className="border rounded overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0b5bb0]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-white h-8 text-center border-r">SL. NO.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Exam</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Roll Number</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Merit Number</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">RegistrationId</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">TotalMaxMarks</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">ObtainedMarks</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">ALLIndiaRank</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">CategoryRank</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Percentile</TableHead>
                                    <TableHead className="text-white h-8 text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {competitiveFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="p-1 border-r text-center">{index + 1}</TableCell>
                                        <TableCell className="p-1 border-r">
                                            <FormField control={control} name={`competitiveExams.${index}.exam`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-7 text-xs border-0"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="jee">JEE</SelectItem></SelectContent></Select>
                                            )} />
                                        </TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.rollNo`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.meritNo`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.registrationId`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.totalMaxMarks`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.obtainedMarks`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.allIndiaRank`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.categoryRank`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveExams.${index}.percentile`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 text-center">
                                            <Button type="button" variant="ghost" className="h-7 w-7 p-0 text-[#0b5bb0]" onClick={() => index === 0 ? appendComp({}) : removeComp(index)}>
                                                {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* COMPETITIVE EXAM SUBJECTWISE MARKS DETAILS */}
                <div>
                    <h4 className="font-bold text-[#244b8a] text-sm mb-2 uppercase">Competitive Exam Subjectwise Marks Details</h4>
                    <div className="border rounded overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0b5bb0]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-white h-8 text-center border-r w-[60px]">SL. NO.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r w-[25%]">Exam Name</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r w-[25%]">Subject Name</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Max Marks</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Marks Obtained</TableHead>
                                    <TableHead className="text-white h-8 text-center w-[80px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjectFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="p-1 border-r text-center">{index + 1}</TableCell>
                                        <TableCell className="p-1 border-r">
                                            <FormField control={control} name={`competitiveSubjects.${index}.examName`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-7 text-xs border-0"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="jee">JEE</SelectItem></SelectContent></Select>
                                            )} />
                                        </TableCell>
                                        <TableCell className="p-1 border-r">
                                            <FormField control={control} name={`competitiveSubjects.${index}.subjectName`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-7 text-xs border-0"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="math">Mathematics</SelectItem></SelectContent></Select>
                                            )} />
                                        </TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveSubjects.${index}.maxMarks`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`competitiveSubjects.${index}.marksObtained`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 text-center">
                                            <Button type="button" variant="ghost" className="h-7 w-7 p-0 text-[#0b5bb0]" onClick={() => index === 0 ? appendSubj({}) : removeSubj(index)}>
                                                {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* GUARDIAN DETAILS */}
                <div className="border border-muted">
                    <div className="text-center font-bold text-[#244b8a] p-2 bg-muted/20 border-b uppercase text-sm">
                        Guardian Details
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                        <FormField control={control} name="AMCST_GuardianName" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs text-right pr-2">Guardian Name</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                        )} />
                        <FormField control={control} name="AMCST_GuardianAddress" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs text-right pr-2">Guardian Address</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                        )} />
                        <FormField control={control} name="AMCST_GuardianEmailId" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs text-right pr-2">Guardian Email</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-center gap-2">
                            <div className="col-span-1 text-xs text-right pr-2">Guardian Phone</div>
                            <div className="col-span-2 flex gap-1">
                                <FormField control={control} name="AMCST_GuardianCountryCode" render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-8 w-[100px]"><SelectValue placeholder="Code" /></SelectTrigger></FormControl><SelectContent><SelectItem value="91">91</SelectItem></SelectContent></Select>
                                )} />
                                <FormField control={control} name="AMCST_GuardianPhoneNo" render={({ field }) => (
                                    <FormControl className="flex-1"><Input {...field} className="h-8" /></FormControl>
                                )} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2"><div className="col-span-1 text-xs text-right pr-2">Guardian Photo</div><div className="col-span-2 text-xs text-muted-foreground pt-1">File Uploader Placeholder</div></div>
                        <div className="grid grid-cols-3 items-center gap-2"><div className="col-span-1 text-xs text-right pr-2">Guardian Sign</div><div className="col-span-2 text-xs text-muted-foreground pt-1">File Uploader Placeholder</div></div>
                        
                        <div className="grid grid-cols-3 items-center gap-2"><div className="col-span-1 text-xs text-right pr-2">Guardian Finger Print</div><div className="col-span-2 text-xs text-muted-foreground pt-1">File Uploader Placeholder</div></div>
                    </div>
                    <div className="flex justify-end p-2 border-t">
                        <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-8 text-xs px-6"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                </div>

                {/* SIBLINGS DETAILS */}
                <div>
                    <h4 className="font-bold text-[#244b8a] text-sm mb-2 uppercase">Siblings Details</h4>
                    <div className="border rounded overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0b5bb0]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-white h-8 text-center border-r w-[60px]">SL.NO.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r w-[40%]">Name</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r w-[30%]">Course</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r">Relation</TableHead>
                                    <TableHead className="text-white h-8 text-center w-[80px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {siblingFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="p-1 border-r text-center">{index + 1}</TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`siblingsDetails.${index}.name`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 border-r">
                                            <FormField control={control} name={`siblingsDetails.${index}.course`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-7 text-xs border-0"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent><SelectItem value="puc">PUC</SelectItem></SelectContent></Select>
                                            )} />
                                        </TableCell>
                                        <TableCell className="p-1 border-r"><FormField control={control} name={`siblingsDetails.${index}.relation`} render={({ field }) => (<Input {...field} className="h-7 text-xs border-0" />)} /></TableCell>
                                        <TableCell className="p-1 text-center">
                                            <Button type="button" variant="ghost" className="h-7 w-7 p-0 text-[#0b5bb0]" onClick={() => index === 0 ? appendSib({}) : removeSib(index)}>
                                                {index === 0 ? <Plus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PASSPORT DETAILS */}
                    <div className="border border-muted">
                        <div className="text-center font-bold text-[#244b8a] p-2 bg-muted/20 border-b uppercase text-sm">Passport Details</div>
                        <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-4">
                            <FormField control={control} name="AMCST_PassportNo" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Passport No</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="AMCST_PassportIssuedAt" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Issued At</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="AMCST_PassportIssueDate" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Issue Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl className="col-span-2"><Button variant="outline" className={cn("h-8 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span className="text-xs">Select date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                            )} />
                            <FormField control={control} name="AMCST_PassportIssuedCountry" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Issued Country</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger className="h-8"><SelectValue placeholder="-Select-" /></SelectTrigger></FormControl><SelectContent>{initialData?.allcountry?.map((c:any)=><SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                            <FormField control={control} name="AMCST_PassportIssuedPlace" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Issued Place</FormLabel><FormControl className="col-span-2"><Input {...field} className="h-8" /></FormControl></FormItem>
                            )} />
                            <FormField control={control} name="AMCST_PassportExpiryDate" render={({ field }) => (
                                <FormItem className="grid grid-cols-3 items-center gap-2"><FormLabel className="col-span-1 text-xs">Expiry Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl className="col-span-2"><Button variant="outline" className={cn("h-8 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span className="text-xs">Select date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover></FormItem>
                            )} />
                        </div>
                    </div>
                    {/* VISA DETAILS */}
                    <div className="border border-muted flex flex-col">
                        <div className="text-center font-bold text-[#244b8a] p-2 bg-muted/20 border-b uppercase text-sm">Visa Details</div>
                        <div className="p-4 grid grid-cols-1 gap-4">
                            <FormField control={control} name="AMCST_VisaIssuedBy" render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-2"><FormLabel className="col-span-1 text-xs">Issued By</FormLabel><FormControl className="col-span-3"><Input {...field} className="h-8 w-full md:w-1/2" /></FormControl></FormItem>
                            )} />
                            <div className="grid grid-cols-4 items-center gap-2">
                                <div className="col-span-1 text-xs">Valid From</div>
                                <div className="col-span-3 flex gap-2 items-center">
                                    <FormField control={control} name="AMCST_VisaValidFrom" render={({ field }) => (
                                        <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("h-8 w-[140px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span className="text-xs">Select date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                    )} />
                                    <span className="text-xs font-medium">Valid To</span>
                                    <FormField control={control} name="AMCST_VisaValidTo" render={({ field }) => (
                                        <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("h-8 w-[140px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd-MM-yyyy") : <span className="text-xs">Select date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                    )} />
                                </div>
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
