'use client';

import { Button } from '@/components/ui/button';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNumberPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PageNumberPagination({ page, totalPages, onPageChange }: PageNumberPaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] =
        totalPages <= 7
            ? Array.from({ length: totalPages }, (_, index) => index + 1)
            : page <= 3
              ? [1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages]
              : page >= totalPages - 2
                ? [1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                : [1, 2, '...', page - 1, page, page + 1, '...', totalPages - 1, totalPages];

    return (
        <div className='pagination-bar'>
            <Button
                aria-label='Go to first page'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full p-0'
                onClick={() => onPageChange(1)}
                disabled={page <= 1}>
                <DoubleArrowLeftIcon className='h-4 w-4' />
            </Button>
            <Button
                aria-label='Go to previous page'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full p-0'
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}>
                <ChevronLeft className='h-4 w-4' />
            </Button>

            {pages.map((pageNumber, index) =>
                pageNumber === '...' ? (
                    <span key={`dots-${index}`} className='px-2 text-slate-400'>
                        ...
                    </span>
                ) : (
                    <button
                        key={pageNumber}
                        type='button'
                        onClick={() => onPageChange(pageNumber)}
                        className={`pagination-item ${page === pageNumber ? 'pagination-item-active' : ''}`}>
                        {pageNumber}
                    </button>
                )
            )}

            <Button
                aria-label='Go to next page'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full p-0'
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}>
                <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
                aria-label='Go to last page'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full p-0'
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages}>
                <DoubleArrowRightIcon className='h-4 w-4' />
            </Button>
        </div>
    );
}
