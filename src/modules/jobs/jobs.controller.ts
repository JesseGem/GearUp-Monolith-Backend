import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JobsService } from './jobs.service.js';

import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { CompleteJobDto } from './dto/complete-job.dto.js';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

import { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { UserRole } from '../users/enums/user-role.enum.js';

@ApiTags('Jobs')
@ApiBearerAuth('access-token')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a service job',
    description:
      'Create a new vehicle service job for the currently authenticated customer. The selected vehicle must belong to the customer.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Service job created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid job data or vehicle UUID.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Vehicle not found or does not belong to the authenticated user.',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(
      user.userId,
      createJobDto,
    );
  }

  // Mechanics see unassigned pending jobs
  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiOperation({
    summary: 'List available jobs',
    description:
      'Retrieve pending jobs that have not yet been assigned to a mechanic. Only mechanics can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Available jobs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Authenticated user is not a mechanic.',
  })
  findAvailable() {
    return this.jobsService.findAvailableForMechanics();
  }

  // Customers see their jobs.
  // Mechanics see their assigned jobs.
  // Admins see all jobs.
  @Get()
  @ApiOperation({
    summary: 'List jobs',
    description:
      'Customers receive their own jobs, mechanics receive jobs assigned to them, and administrators receive all jobs.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Jobs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobsService.findAll(user);
  }

  // Mechanic accepts a pending job
  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiOperation({
    summary: 'Accept a job',
    description:
      'Accept an available pending job. The job becomes assigned to the authenticated mechanic and moves to in_progress status.',
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job to accept.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job accepted successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid job UUID.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Authenticated user is not a mechanic.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Job is no longer available for acceptance.',
  })
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobsService.accept(
      id,
      user.userId,
    );
  }

  // Mechanic completes an in-progress job
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiOperation({
    summary: 'Complete a job',
    description:
      'Mark an in-progress job as completed and record its final cost. Only the mechanic assigned to the job can complete it.',
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job to complete.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job completed successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID or final cost.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Authenticated user is not a mechanic.',
  })
  @ApiResponse({
    status: 404,
    description:
      'In-progress job was not found for the authenticated mechanic.',
  })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() completeJobDto: CompleteJobDto,
  ) {
    return this.jobsService.complete(
      id,
      user.userId,
      completeJobDto,
    );
  }

  // Customer, mechanic, or admin can cancel
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.CUSTOMER,
    UserRole.MECHANIC,
    UserRole.ADMIN,
  )
  @ApiOperation({
    summary: 'Cancel a job',
    description:
      "Cancel a job according to the permissions and workflow rules of the authenticated user's role.",
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job to cancel.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job cancelled successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Job cannot be cancelled in its current state.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Authenticated user is not allowed to cancel this job.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Job not found.',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobsService.cancel(
      id,
      user,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a job',
    description:
      'Retrieve a specific job. Customers can access their own jobs, mechanics can access jobs assigned to them, and administrators can access any job.',
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid job UUID.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Job not found or not accessible to the authenticated user.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobsService.findOne(
      id,
      user,
    );
  }

  // Customer edits their pending job
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a pending job',
    description:
      'Update the title, description, or estimated cost of the authenticated customer’s pending job. Status and final cost are controlled through dedicated workflow endpoints.',
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job to update.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid UUID or job data.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only pending jobs can be edited.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Job not found or does not belong to the authenticated user.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(
      id,
      user.userId,
      updateJobDto,
    );
  }

  // Customer deletes their pending job
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a pending job',
    description:
      'Delete a pending job belonging to the authenticated customer. Jobs in other states cannot be deleted through this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description:
      'UUID of the job to delete.',
    example:
      '3bd1fb76-4e44-4350-a7a7-ccb0727442fb',
  })
  @ApiResponse({
    status: 200,
    description:
      'Job deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid job UUID.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication token is missing, invalid, or the account is inactive.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only pending jobs can be deleted.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Job not found or does not belong to the authenticated user.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jobsService.remove(
      id,
      user.userId,
    );
  }
}