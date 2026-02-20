import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @Get('verify-email/:token')
    async verifyEmail(@Param('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetDto: any) {
        return this.authService.resetPassword(resetDto);
    }

    @Post('2fa/setup')
    @UseGuards(JwtAuthGuard)
    async setupTwoFactor(@Request() req) {
        return this.authService.setupTwoFactor(req.user.userId);
    }

    @Post('2fa/verify')
    @UseGuards(JwtAuthGuard)
    async verifyTwoFactor(@Request() req, @Body('code') code: string) {
        return this.authService.verifyTwoFactor(req.user.userId, code);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: any) {
        return this.authService.login(loginDto);
    }
}
