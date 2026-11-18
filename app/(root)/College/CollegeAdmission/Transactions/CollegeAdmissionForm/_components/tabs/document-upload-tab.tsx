'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';

const MOCK_DOCS = [
    'Transfer Certificate',
    'Marks Card',
    'Aadhar Card',
    'Caste certificate',
    'Income certificate'
];

export function DocumentUploadTab({ initialData, onBack }: { initialData: any, onBack: () => void }) {
    const { control } = useFormContext();

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="grid gap-6 p-0">
                
                {/* Document Upload Details Table */}
                <div className="border border-muted">
                    <div className="font-bold text-white text-xs p-2 bg-[#244b8a]">
                        Document Upload Details (Only JPEG Files [0-2MB])
                    </div>
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0b5bb0]">
                                <TableRow className="hover:bg-transparent border-b-0">
                                    <TableHead className="text-white h-8 text-center border-r border-white/20 w-[100px]">SL. NO.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r border-white/20">Document Name</TableHead>
                                    <TableHead className="text-white h-8 text-center w-[200px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_DOCS.map((doc, i) => (
                                    <TableRow key={i} className="even:bg-muted/30">
                                        <TableCell className="p-2 border-r text-center text-xs">{i + 1}</TableCell>
                                        <TableCell className="p-2 border-r text-xs">{doc}</TableCell>
                                        <TableCell className="p-2 text-center">
                                            <div className="relative">
                                                <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">
                                                    Upload Document
                                                </Button>
                                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Photo Upload Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Father */}
                    <div className="border border-muted">
                        <div className="font-bold text-white text-xs p-2 bg-[#244b8a]">
                            Photo Upload(Only JPEG Files [0-2MB])
                        </div>
                        <div className="p-0">
                            <div className="grid grid-cols-3 items-center border-b p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Father's Photo:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Father Photo</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center border-b p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Father's Signature:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Father Signature</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Father's Fingerprint:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Father Fringer Print</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mother */}
                    <div className="border border-muted">
                        <div className="font-bold text-white text-xs p-2 bg-[#244b8a]">
                            Photo Upload(Only JPEG Files [0-2MB])
                        </div>
                        <div className="p-0">
                            <div className="grid grid-cols-3 items-center border-b p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Mother's Photo:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Mother Photo</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center border-b p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Mother's Signature:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Mother Signature</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center p-2">
                                <div className="col-span-1 text-xs text-right pr-4">Mother's Fingerprint:</div>
                                <div className="col-span-2 relative">
                                    <Button type="button" className="bg-[#244b8a] hover:bg-[#1a3869] h-7 text-xs w-full">Upload Mother Fringer Print</Button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Required Details */}
                <div className="border border-muted">
                    <div className="font-bold text-white text-xs p-2 bg-[#244b8a]">
                        Required Details
                    </div>
                    <div className="p-3 flex items-center space-x-8">
                        <FormField control={control} name="is_hostel_req" render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox id="hostel" checked={field.value} onCheckedChange={field.onChange} />
                                <label htmlFor="hostel" className="text-xs cursor-pointer">Hostel Required</label>
                            </div>
                        )} />
                        <FormField control={control} name="is_transport_req" render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox id="transport" checked={field.value} onCheckedChange={field.onChange} />
                                <label htmlFor="transport" className="text-xs cursor-pointer">Transport Required</label>
                            </div>
                        )} />
                        <FormField control={control} name="is_gym_req" render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox id="gym" checked={field.value} onCheckedChange={field.onChange} />
                                <label htmlFor="gym" className="text-xs cursor-pointer">Gym Required</label>
                            </div>
                        )} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-4 pt-4 pb-8">
                    <Button type="button" variant="outline" className="bg-[#244b8a] text-white hover:bg-[#1a3869] hover:text-white" onClick={onBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        PREVIOUS
                    </Button>
                    <Button type="submit" className="bg-[#244b8a] hover:bg-[#1a3869]">
                        SUBMIT
                    </Button>
                    <Button type="button" variant="destructive" className="bg-[#f04a23] hover:bg-[#d03d1b]" onClick={() => window.location.reload()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        CLEAR ALL
                    </Button>
                </div>

                <hr className="border-t-2 border-[#244b8a]" />

                {/* STUDENT'S DETAILS Grid Placeholder */}
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-[#244b8a] text-sm uppercase">Student's Details</div>
                        <div className="text-xs text-[#f04a23] font-medium">Note : Click On Student Name To View The Profile</div>
                    </div>
                    
                    <div className="border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#0b5bb0]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Sl.No</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Name/View Profile</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Course</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Branch</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Date</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Gender</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Reg.No.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Adm.No.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Email Id</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Mobile No.</TableHead>
                                    <TableHead className="text-white h-8 text-center border-r text-xs">Status</TableHead>
                                    <TableHead className="text-white h-8 text-center text-xs">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="even:bg-muted/30">
                                    <TableCell className="p-1 border-r text-center text-xs">1</TableCell>
                                    <TableCell className="p-1 border-r text-xs text-blue-600 cursor-pointer">Afsana Taj</TableCell>
                                    <TableCell className="p-1 border-r text-xs">BBA</TableCell>
                                    <TableCell className="p-1 border-r text-xs">BBA (General)</TableCell>
                                    <TableCell className="p-1 border-r text-center text-xs">03-07-2026</TableCell>
                                    <TableCell className="p-1 border-r text-xs">Female</TableCell>
                                    <TableCell className="p-1 border-r text-xs">U18JM25M0001</TableCell>
                                    <TableCell className="p-1 border-r text-xs">U18JM25M0001</TableCell>
                                    <TableCell className="p-1 border-r text-xs">student@gmail.com</TableCell>
                                    <TableCell className="p-1 border-r text-xs">9999999999</TableCell>
                                    <TableCell className="p-1 border-r text-center text-xs">Active</TableCell>
                                    <TableCell className="p-1 text-center text-xs space-x-1">
                                        <button className="text-blue-500 hover:underline">📝</button>
                                        <button className="text-red-500 hover:underline">🗑️</button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
