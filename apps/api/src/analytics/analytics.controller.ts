import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('monthly-summary')
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

    @Get('trends')
    getTrends(@Request() req) {
        return this.analyticsService.getTrends(req.user.userId);
    }

    @Get('yearly-summary')
    getYearlySummary(@Request() req, @Query('year') year?: string) {
        const y = year ? parseInt(year) : new Date().getFullYear();
        return this.analyticsService.getYearlySummary(req.user.userId, y);
    }

    @Get('category-distribution')
    getCategoryDistribution(@Request() req, @Query('type') type: string = 'expense') {
        return this.analyticsService.getCategoryDistribution(req.user.userId, type);
    }
}
