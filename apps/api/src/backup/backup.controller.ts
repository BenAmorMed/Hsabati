import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
    constructor(private backupService: BackupService) { }

    @Get('export')
    exportData(@Request() req) {
        return this.backupService.exportData(req.user.userId);
    }

    @Post('import')
    importData(@Request() req, @Body() data: any) {
        return this.backupService.importData(req.user.userId, data);
    }
}
