// flights.controller.ts
import { Controller, Get, Post, Query, Logger, Body, Param } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  private readonly logger = new Logger(FlightsController.name);

  constructor(private readonly flightsService: FlightsService) {}

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

  // добавьте в imports: Body уже есть
  @Post('fare-info')
  async fareInfo(@Body() body: any) {
    this.logger.log('=== POST /flights/fare-info called ===');
    this.logger.log(`Body received for fare-info: ${JSON.stringify(body)}`);
    return await this.flightsService.getFareInfo(body);
  }

  @Post(':offerId/brand-fares')
async loadBrandFares(
  @Param('offerId') offerId: string,
) {
  return this.flightsService.loadBrandFares(offerId);
}
}

