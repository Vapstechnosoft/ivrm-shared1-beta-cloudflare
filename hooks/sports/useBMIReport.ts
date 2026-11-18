import { getBMIReport, getBMIReportLoadData, getClassesForBMI, getSectionsForBMI } from '@/server/sports/reports/bmi-report';
import type { ApiSearchparams } from '@/types';
import type { IBMIReportRequest } from '@/types/sports/reports/bmi-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBMIReport = () => {
    const loadData = useQuery({
        queryKey: ['bmiReportLoadData'],
        queryFn: () => getBMIReportLoadData()
    });

    const getClasses = useMutation({
        mutationFn: (asMAY_Id: number) => getClassesForBMI(asMAY_Id)
    });

    const getSections = useMutation({
        mutationFn: ({ asMAY_Id, asmcL_Id }: { asMAY_Id: number; asmcL_Id: number }) => getSectionsForBMI(asMAY_Id, asmcL_Id)
    });

    const generateReport = useMutation({
        mutationFn: ({ data, searchParams }: { data: IBMIReportRequest; searchParams?: ApiSearchparams }) =>
            getBMIReport(data, searchParams)
    });

    return {
        loadData,
        getClasses,
        getSections,
        generateReport
    };
};
