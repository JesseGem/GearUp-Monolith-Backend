import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job, JobStatus } from './entities/job.entity.js';
import { Vehicle } from '../vehicles/entities/vehicle.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(
    userId: string,
    createJobDto: CreateJobDto,
  ): Promise<Job> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: {
        id: createJobDto.vehicleId,
        userId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found or does not belong to this user',
      );
    }

    const job = new Job();

    job.title = createJobDto.title;
    job.description = createJobDto.description ?? '';
    job.vehicleId = vehicle.id;
    job.userId = userId;
    job.status = JobStatus.PENDING;
    job.estimatedCost = createJobDto.estimatedCost ?? 0;
    job.finalCost = 0;

    return this.jobsRepository.save(job);
  }

  async findAllByUser(userId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { userId },
      relations: {
        vehicle: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        vehicle: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(
    id: string,
    userId: string,
    updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (updateJobDto.title !== undefined) {
      job.title = updateJobDto.title;
    }

    if (updateJobDto.description !== undefined) {
      job.description = updateJobDto.description;
    }

    if (updateJobDto.status !== undefined) {
      job.status = updateJobDto.status;
    }

    if (updateJobDto.estimatedCost !== undefined) {
      job.estimatedCost = updateJobDto.estimatedCost;
    }

    if (updateJobDto.finalCost !== undefined) {
      job.finalCost = updateJobDto.finalCost;
    }

    return this.jobsRepository.save(job);
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const job = await this.jobsRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.jobsRepository.remove(job);

    return {
      message: 'Job deleted successfully',
    };
  }
}