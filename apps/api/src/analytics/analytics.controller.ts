import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('summary')
    getMonthlySummary(
        @Request() req,
        @Query('year') year: string,
        @Query('month') month: string,
    ) {
        return this.analyticsService.getMonthlySummary(
            req.user.userId,
            parseInt(year),
            parseInt(month),
        );
    }

    @Get('overview')
    getOverview(@Request() req) {
        return this.analyticsService.getOverview(req.user.userId);
    }
}
