/**
 * booking.controller.ts - Контроллер для управления бронированиями
 * 
 * Этот контроллер обрабатывает HTTP запросы связанные с бронированиями:
 * - POST /booking/create - создание нового бронирования
 * - GET /booking - получение списка бронирований пользователя
 * - GET /booking/:id - получение конкретного бронирования
 * - GET /booking/:id/pdf - генерация и скачивание PDF билета
 * 
 * Все маршруты защищены JWT авторизацией (кроме некоторых публичных)
 * 
 * @module BookingController
 */

import { Controller, Post, Body, Get, Param, Res, Request, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as streamBuffers from 'stream-buffers';
import * as path from 'path';
import * as fs from 'fs';
import * as bwipjs from 'bwip-js';
import { ForbiddenException } from '@nestjs/common';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  public async create(@Request() req, @Body() body: any) {
    try {
      console.log('[Booking] Create request from user:', req.user.sub);
      console.log('[Booking] Body:', JSON.stringify(body, null, 2));
      
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
      console.error('[Booking] Error:', error);
      return {
        ok: false,
        error: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getUserBookings(@Request() req) {
    const bookings = await this.bookingService.getUserBookings(req.user.sub);
    return bookings.map(b => b.toObject());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  public async getBooking(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const booking = await this.bookingService.getById(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    return res.json(booking);
  }

@Get(':id/blank/file')
@UseGuards(JwtAuthGuard)
async downloadBlank(
  @Request() req,
  @Param('id') id: string,
  @Res() res: Response,
) {
  const booking = await this.bookingService.getById(id);

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.user.toString() !== req.user.sub) {
    throw new ForbiddenException('Forbidden');
  }

  if (!booking.rawProviderData?.blank?.fileId) {
    throw new NotFoundException('Blank not found');
  }

  const filePath = path.join(
    process.cwd(),
    'storage',
    'blanks',
    booking.rawProviderData.blank.fileId,
  );

  if (!fs.existsSync(filePath)) {
    throw new NotFoundException('Blank file missing');
  }

  res.setHeader(
    'Content-Type',
    booking.rawProviderData.blank.contentType || 'application/pdf',
  );

  res.sendFile(filePath);
}

@Post(':id/recalc')
@UseGuards(JwtAuthGuard)
public async recalc(
  @Request() req,
  @Param('id') id: string,
) {
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
public async pay(
  @Request() req,
  @Param('id') id: string,
) {
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
public async confirm(
  @Request() req,
  @Param('id') id: string,
) {
  const booking = await this.bookingService.getById(id);
  if (!booking) {
    return { ok: false, error: 'Booking not found' };
  }

  if (booking.user.toString() !== req.user.sub) {
    return { ok: false, error: 'Forbidden' };
  }

  const result =
    await this.bookingService.confirmOnelya(
      booking.providerBookingId!,
    );

  return {
    ok: true,
    result,
  };
}
}