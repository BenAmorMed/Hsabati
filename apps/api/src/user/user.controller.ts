import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private userService: UserService) { }

    @Get('profile')
    getProfile(@Request() req) {
        return this.userService.getProfile(req.user.userId);
    }

    @Patch('settings')
    updateSettings(@Request() req, @Body() updateDto: any) {
        return this.userService.updateSettings(req.user.userId, updateDto);
    }
}
