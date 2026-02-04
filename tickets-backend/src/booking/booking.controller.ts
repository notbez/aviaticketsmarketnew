import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Res,
  Request,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Booking management controller
 * Handles flight booking lifecycle: creation, payment, confirmation, and document generation
 * TODO: Add booking status validation middleware and audit logging
 */
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create new flight booking
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  public async create(@Request() req, @Body() body: any) {
    try {
      const res = await this.bookingService.create(req.user.sub, body);

      if (res.booking) {
        const bookingObj = res.booking.toObject();
        return {
          ...bookingObj,
          _id: bookingObj._id.toString(),
          ok: true,
        };
      }

      return {
        ok: false,
        error: 'error' in res ? res.error : 'Failed to create booking',
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || 'Internal server error',
      };
    }
  }

  /**
   * Booking retrieval endpoints
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  public async getUserBookings(@Request() req) {
    const bookings = await this.bookingService.getUserBookings(req.user.sub);
    return bookings.map(b => b.toObject());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getBooking(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const booking = await this.bookingService.getById(id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.user.toString() !== req.user.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    return res.json(booking);
  }

  /**
   * Booking lifecycle management endpoints
   */
  @Post(':id/recalc')
  @UseGuards(JwtAuthGuard)
  public async recalc(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.getById(id);
    if (!booking) return { ok: false, error: 'Booking not found' };
    if (booking.user.toString() !== req.user.sub)
      return { ok: false, error: 'Forbidden' };

    const result = await this.bookingService.recalcOnelya(
      booking.providerBookingId!,
    );

    return { ok: true, result };
  }

  @Post(':id/pay')
  @UseGuards(JwtAuthGuard)
  public async pay(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.getById(id);
    if (!booking) return { ok: false, error: 'Booking not found' };
    if (booking.user.toString() !== req.user.sub)
      return { ok: false, error: 'Forbidden' };

    const result = await this.bookingService.virtualPay(
      booking.providerBookingId!,
    );

    return { ok: true, result };
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  public async confirm(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.getById(id);
    if (!booking) return { ok: false, error: 'Booking not found' };
    if (booking.user.toString() !== req.user.sub)
      return { ok: false, error: 'Forbidden' };

    const result = await this.bookingService.confirmOnelya(
      booking.providerBookingId!,
    );

    return { ok: true, result };
  }

  /**
   * Document generation and access endpoints
   * TODO: Implement document expiration and regeneration logic
   */
  @Post(':id/blank')
  @UseGuards(JwtAuthGuard)
  async generateBlank(@Request() req, @Param('id') id: string) {
    const booking = await this.bookingService.getById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.user.toString() !== req.user.sub) {
      throw new ForbiddenException('Forbidden');
    }

    console.log('🔥 BLANK GENERATE CALLED');
    return this.bookingService.getBlankByBookingId(id);
  }

  /**
   * Public document download with token-based access control
   */
  @Get(':id/blank/file')
  async downloadBlankPublic(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const booking = await this.bookingService.getById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    let blank = booking.rawProviderData?.blank;

    if (!blank) {
      throw new NotFoundException('Blank not generated');
    }

    if (!token || token !== blank.accessToken) {
      throw new ForbiddenException('Invalid access token');
    }

    const filePath = path.join(
      process.cwd(),
      'storage',
      'blanks',
      blank.fileId,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Blank file missing');
    }

    res.setHeader(
      'Content-Type',
      blank.contentType || 'application/pdf',
    );
    res.setHeader(
      'Content-Disposition',
      `inline; filename=${blank.fileId}`,
    );

    return res.sendFile(filePath);
  }
}