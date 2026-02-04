import { Controller, Get, Post, Query, Logger, Body, Param } from '@nestjs/common';
import { FlightsService } from './flights.service';

/**
 * Flight search and booking controller
 * Handles flight search requests, fare information, and brand fare retrieval
 * TODO: Add request validation DTOs and response transformation
 */
@Controller('flights')
export class FlightsController {
  private readonly logger = new Logger(FlightsController.name);

  constructor(private readonly flightsService: FlightsService) {}

  /**
   * Health check endpoint for service monitoring
   */
  @Get('health')
  health() {
    this.logger.log('Health check requested');
    return {
      status: 'ok',
      service: 'flights',
      timestamp: new Date().toISOString(),
      message: 'Flights service is running',
    };
  }

  /**
   * Flight search endpoints - supports both GET and POST methods
   */
  @Get('search')
  async search(@Query() query: any) {
    this.logger.log('GET /flights/search called');
    return await this.flightsService.search(query);
  }

  @Post('search')
  async searchPost(@Body() body: any) {
    this.logger.log('=== POST /flights/search called ===');
    this.logger.log(`Body received: ${JSON.stringify(body)}`);
    return await this.flightsService.search(body);
  }

  /**
   * Detailed fare information for specific flight segments
   */
  @Post('fare-info')
  async fareInfo(@Body() body: any) {
    this.logger.log('=== POST /flights/fare-info called ===');
    this.logger.log(`Body received for fare-info: ${JSON.stringify(body)}`);
    return await this.flightsService.getFareInfo(body);
  }

  /**
   * Brand fare options with pricing and amenities
   */
  @Post('brand-fares')
  async brandFares(@Body() body: any) {
    this.logger.log('=== POST /flights/brand-fares called ===');
    return await this.flightsService.getBrandFares(body);
  }
}