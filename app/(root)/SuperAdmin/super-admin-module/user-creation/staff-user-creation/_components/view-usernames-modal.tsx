'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EmployeeListDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { Download, Printer, Search } from 'lucide-react';
import { useState } from 'react';

interface ViewUsernamesModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: EmployeeListDTO[];
    roleName?: string;
}

export default function ViewUsernamesModal({ isOpen, onClose, users, roleName }: ViewUsernamesModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const isAdmin = roleName?.toUpperCase() === 'ADMIN' || roleName?.toUpperCase() === 'SUPER ADMIN';

    const filteredUsers = users.filter(
        (user) =>
            (user.stafname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.hrmE_EmployeeCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.user_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.intname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.mI_Name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportToExcel = () => {
        let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

        if (isAdmin) {
            csvContent += 'SL.NO.,Institute Name,User Name\n';
            filteredUsers.forEach((user, index) => {
                const instituteName = (user.intname || user.mI_Name || '------').replace(/"/g, '""');
                const userName = (user.user_Name || '------').replace(/"/g, '""');
                csvContent += `${index + 1},"${instituteName}","${userName}"\n`;
            });
        } else {
            csvContent += 'SL.NO.,Employee Name,Employee Code,User Name\n';
            filteredUsers.forEach((user, index) => {
                const empName = (user.stafname || '------').replace(/"/g, '""');
                const empCode = (user.hrmE_EmployeeCode || '------').replace(/"/g, '""');
                const userName = (user.user_Name || '------').replace(/"/g, '""');
                csvContent += `${index + 1},"${empName}","${empCode}","${userName}"\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${isAdmin ? 'Admin_Users' : 'Employee_Users'}_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        if (filteredUsers.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const title = isAdmin ? 'Admin List With Usernames' : 'Employee List With Usernames';

        let printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; color: #1e3a8a; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #4f46e5; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 80px; text-align: center;">SL.NO.</th>`;
        
        if (isAdmin) {
            printContent += `
                            <th>Institute Name</th>
                            <th>User Name</th>`;
        } else {
            printContent += `
                            <th>Employee Name</th>
                            <th>Employee Code</th>
                            <th>User Name</th>`;
        }

        printContent += `
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.map((user, index) => {
                            let rowHTML = `<tr>
                                <td style="text-align: center;">${index + 1}</td>`;
                            
                            if (isAdmin) {
                                rowHTML += `
                                <td>${user.intname || user.mI_Name || '------'}</td>
                                <td>${user.user_Name || '------'}</td>`;
                            } else {
                                rowHTML += `
                                <td>${user.stafname || '------'}</td>
                                <td>${user.hrmE_EmployeeCode || '------'}</td>
                                <td>${user.user_Name || '------'}</td>`;
                            }
                            
                            rowHTML += `</tr>`;
                            return rowHTML;
                        }).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0'>
                <DialogHeader className='border-b bg-blue-50 p-6'>
                    <DialogTitle className='font-bold text-blue-900 text-xl'>
                        {isAdmin ? 'Admin List With Usernames' : 'Employee List With Usernames'}
                    </DialogTitle>
                    <p className='mt-1 text-blue-700 text-sm uppercase'>
                        NOTE: EXISTING USERNAMES FOR <b>{roleName || 'SELECTED ROLE'}</b>
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleExportToExcel} 
                            variant="outline" 
                            className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 w-fit"
                        >
                            <Download className="h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button 
                            onClick={handlePrint} 
                            variant="outline" 
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 w-fit"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </DialogHeader>

                

                <div className='flex items-center gap-4 border-b bg-gray-50 p-4'>
                    <div className='relative flex-1'>
                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-gray-400' />
                        <Input
                            placeholder={isAdmin ? 'Search by institution or username...' : 'Search by name, code, or username...'}
                            className='pl-10'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                </div>

                <div className='flex-1 overflow-hidden'>
                    <ScrollArea className='h-[50vh] w-full'>
                        <Table>
                            <TableHeader className='sticky top-0 z-10 bg-gray-100 shadow-sm'>
                                <TableRow>
                                    <TableHead className='w-[80px] text-center'>SL.NO.</TableHead>
                                    {isAdmin ? (
                                        <>
                                            <TableHead>Institute Name</TableHead>
                                            <TableHead>User Name</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead>Employee Name</TableHead>
                                            <TableHead className='text-center'>Employee Code</TableHead>
                                            <TableHead>User Name</TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <TableRow key={index} className='transition-colors hover:bg-blue-50/30'>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            {isAdmin ? (
                                                <>
                                                    <TableCell>{user.intname || user.mI_Name || '------'}</TableCell>
                                                    <TableCell className='font-semibold text-blue-700'>{user.user_Name}</TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{user.stafname || '------'}</TableCell>
                                                    <TableCell className='text-center'>{user.hrmE_EmployeeCode || '------'}</TableCell>
                                                    <TableCell className='font-semibold text-blue-700'>{user.user_Name}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 3 : 4} className='h-24 text-center text-gray-500 italic'>
                                            No users found matching your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                <div className='flex justify-end border-t bg-gray-50 p-4'>
                    <Button onClick={onClose} className='px-6'>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
