import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { QueryBankDto } from './dto/query-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  findAll(@Query() query: QueryBankDto) {
    return this.banksService.findAll(query);
  }
}
