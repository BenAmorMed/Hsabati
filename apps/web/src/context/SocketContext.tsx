"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Manager } from 'socket.io-client';

interface SocketContextType {
    socket: any;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, token }: { children: React.ReactNode; token?: string }) => {
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const manager = new Manager(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555', {
            autoConnect: true
        });
        const socketInstance = manager.socket("/");
        (socketInstance as any).auth = { token };

        socketInstance.on('connect', () => setIsConnected(true));
        socketInstance.on('disconnect', () => setIsConnected(false));

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
