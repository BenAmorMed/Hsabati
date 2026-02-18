import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        const token = client.handshake.auth.token || client.handshake.query.token;
        if (!token) {
            client.disconnect();
            return;
        }

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'supersafesecret123');
            client.data.userId = decoded.sub;
            client.join(decoded.sub);
            console.log(`🔌 Client connected: ${decoded.sub} (${client.id})`);
        } catch (err) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`🔌 Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sync_push')
    handleSyncPush(client: Socket, payload: any) {
        // Logic for merge handling will go here
        this.server.to(client.data.userId).emit('sync_needed', payload);
    }

    pushToUser(userId: string, event: string, payload: any) {
        this.server.to(userId).emit(event, payload);
    }
}
