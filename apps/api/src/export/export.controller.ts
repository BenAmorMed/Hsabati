import { Controller, Get, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
    constructor(private exportService: ExportService) { }

    @Get('transactions/csv')
    async exportCsv(@Request() req, @Res() res: Response) {
        const csv = await this.exportService.exportTransactionsCsv(req.user.userId);

        res.header('Content-Type', 'text/csv');
        res.attachment('hsabati-transactions.csv');
        return res.send(csv);
    }
}
