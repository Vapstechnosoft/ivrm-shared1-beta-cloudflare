import type { noticeBoardSchema } from '@/schemas/upload/transactions/notice-board.schema';
import type { z } from 'zod';

export type INoticeBoard = z.infer<typeof noticeBoardSchema>;

export interface INoticeBoardSearch {
    from_date: Date;
    to_date: Date;
}
