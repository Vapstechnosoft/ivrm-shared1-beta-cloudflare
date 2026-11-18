'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useViewClgyearlycoursemappingRecords } from '@/hooks/college/useClgyearlycoursemapping';
import { format } from 'date-fns';

interface DetailsTableProps {
    data: any[];
}

export function DetailsTable({ data }: DetailsTableProps) {
    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const viewMutation = useViewClgyearlycoursemappingRecords();

    const handleView = (user: any) => {
        viewMutation.mutate(user, {
            onSuccess: (res) => {
                const responseData = res?.data || res;
                if (responseData?.getviewdetails) {
                    setViewDetails(responseData.getviewdetails);
                }
            }
        });
    };

    return (
        <div className="w-full">
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-center">SL.No.</th>
                            <th className="px-4 py-3 text-center">Academic Year</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Branch</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 text-center">{index + 1}</td>
                                <td className="px-4 py-3 text-center">{row.asmaY_Year}</td>
                                <td className="px-4 py-3">{row.amcO_CourseName}</td>
                                <td className="px-4 py-3">{row.amB_BranchName}</td>
                                <td className="px-4 py-3 text-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleView(row)}>
                                                <Eye className="w-4 h-4 text-purple-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>YEARLY COURSE BRANCH SEMESTER MAPPING</DialogTitle>
                                            </DialogHeader>
                                            <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                                <table className="w-full text-sm text-left border">
                                                    <thead className="bg-gray-50 text-gray-700">
                                                        <tr>
                                                            <th className="px-4 py-2 border-b">SLNO</th>
                                                            <th className="px-4 py-2 border-b text-center">Semester Name</th>
                                                            <th className="px-4 py-2 border-b text-center">Semester Start Date</th>
                                                            <th className="px-4 py-2 border-b text-center">Semester End Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {viewDetails.map((detail, dIndex) => (
                                                            <tr key={dIndex} className="border-b">
                                                                <td className="px-4 py-2">{dIndex + 1}</td>
                                                                <td className="px-4 py-2 text-center">{detail.amsE_SEMName}</td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {detail.acaycbS_SemStartDate ? format(new Date(detail.acaycbS_SemStartDate), 'dd/MM/yyyy') : ''}
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {detail.acaycbS_SemEndDate ? format(new Date(detail.acaycbS_SemEndDate), 'dd/MM/yyyy') : ''}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
