import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null
            }
        });

        return { success: true, message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't leak user existence
            return { success: true, message: 'If an account exists, a reset link has been sent' };
        }

        const resetToken = randomUUID();
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpires }
        });

        console.log(`[AUTH] Password reset token for ${email}: ${resetToken}`);
        return { success: true, message: 'If an account exists, a reset link has been sent' };
    }

    async resetPassword(data: any) {
        const { token, newPassword } = data;
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        return { success: true, message: 'Password reset successful' };
    }

    async register(data: any) {
        const { email, password, name } = data;

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = randomUUID();

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verificationToken,
                wallet: {
                    create: {
                        balance: 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });

        console.log(`[AUTH] Verification token for ${email}: ${verificationToken}`);

        const payload = { sub: user.id, email: user.email };
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token: await this.jwtService.signAsync(payload),
            },
        };
    }

    async setupTwoFactor(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const secret = speakeasy.generateSecret({
            name: `Hsabati (${user.email})`
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 }
        });

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
        return { success: true, data: { qrCodeUrl, secret: secret.base32 } };
    }

    async verifyTwoFactor(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA not set up');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (!verified) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: true }
        });

        return { success: true, message: '2FA enabled successfully' };
    }

    async login(data: any) {
        const { email, password, twoFactorCode } = data;

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isTwoFactorEnabled) {
            if (!twoFactorCode) {
                return {
                    success: false,
                    requireTwoFactor: true,
                    message: '2FA code required'
                };
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token: twoFactorCode
            });

            if (!verified) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token: await this.jwtService.signAsync(payload),
            },
        };
    }
}
