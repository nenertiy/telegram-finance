import { Module } from '@nestjs/common';
import { SheetsModule } from '../sheets/sheets.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [SheetsModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
