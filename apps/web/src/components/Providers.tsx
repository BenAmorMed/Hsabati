"use client";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

function SocketWrapper({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    return <SocketProvider token={token || undefined}>{children}</SocketProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SocketWrapper>{children}</SocketWrapper>
            </ThemeProvider>
        </AuthProvider>
    );
}
