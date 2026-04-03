import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../../common/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async processPayment(orderId: string, amount: number): Promise<Payment> {
    const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Simulación: 90% de probabilidad de éxito
    const isSuccessful = Math.random() > 0.1;

    const payment = this.paymentsRepository.create({
      orderId,
      amount,
      method: 'mock',
      transactionId,
      status: isSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
    });

    return this.paymentsRepository.save(payment);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where: { orderId } });
  }

  async refund(orderId: string): Promise<Payment | null> {
    const payment = await this.findByOrderId(orderId);
    if (payment && payment.status === PaymentStatus.COMPLETED) {
      payment.status = PaymentStatus.REFUNDED;
      return this.paymentsRepository.save(payment);
    }
    return payment;
  }

  /** Elimina el registro de pago ligado al pedido (p. ej. antes de borrar el pedido). */
  async deleteByOrderId(orderId: string): Promise<void> {
    await this.paymentsRepository.delete({ orderId });
  }
}
