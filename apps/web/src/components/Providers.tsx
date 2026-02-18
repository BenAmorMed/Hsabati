"use client";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import React from "react";

function SocketWrapper({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    return <SocketProvider token={token || undefined}>{children}</SocketProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SocketWrapper>{children}</SocketWrapper>
        </AuthProvider>
    );
}
