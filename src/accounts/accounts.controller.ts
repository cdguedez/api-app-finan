import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(req.user.id, createAccountDto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.accountsService.findAllByUser(req.user.id);
  }
}
