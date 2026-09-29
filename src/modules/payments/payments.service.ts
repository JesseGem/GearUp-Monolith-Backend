import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Payment,
  PaymentStatus,
} from './entities/payment.entity.js';

import { Job } from '../jobs/entities/job.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    let job: Job | null = null;

    if (createPaymentDto.jobId) {
      job = await this.jobsRepository.findOne({
        where: {
          id: createPaymentDto.jobId,
          userId,
        },
      });

      if (!job) {
        throw new NotFoundException(
          'Job not found or does not belong to this user',
        );
      }
    }

    const payment = new Payment();

    payment.amount = createPaymentDto.amount;
    payment.method = createPaymentDto.method;
    payment.status = PaymentStatus.PENDING;
    payment.reference = createPaymentDto.reference ?? '';
    payment.notes = createPaymentDto.notes ?? '';
    payment.userId = userId;
    payment.jobId = job?.id ?? '';

    return this.paymentsRepository.save(payment);
  }

  async findAllByUser(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: {
        userId,
      },
      relations: {
        job: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        job: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment #${id} not found`,
      );
    }

    return payment;
  }
}