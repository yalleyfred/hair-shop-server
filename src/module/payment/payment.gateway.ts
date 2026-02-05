import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/payments', cors: { origin: '*' } })
export class PaymentGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  public handleJoin(client: any, payload: { reference: string }) {
    if (payload?.reference) {
      client.join(payload.reference);
    }
  }

  public emitStatus(reference: string, status: string, data?: any) {
    this.server.to(reference).emit('payment_status', { reference, status, data });
  }
}
