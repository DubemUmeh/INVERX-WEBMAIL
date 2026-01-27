import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DomainsService } from './domains.service.js';
import {
  CreateDomainDto,
  CreateAddressDto,
  DomainQueryDto,
} from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AccountGuard, RoleGuard } from '../common/guards/index.js';

@Controller('domains')
@UseGuards(AccountGuard)
export class DomainsController {
  constructor(private domainsService: DomainsService) {}

  @Get()
  getDomains(
    @CurrentUser('accountId') accountId: string,
    @Query() query: DomainQueryDto,
  ) {
    return this.domainsService.getDomains(accountId, query);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles('owner', 'admin')
  createDomain(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateDomainDto,
  ) {
    return this.domainsService.createDomain(accountId, dto);
  }

  // All addresses for account (must be before :id to avoid route conflict)
  @Get('addresses')
  getAllAddresses(@CurrentUser('accountId') accountId: string) {
    return this.domainsService.getAllAddresses(accountId);
  }

  @Get(':id')
  getDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.getDomain(accountId, domainId);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('owner', 'admin')
  deleteDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.deleteDomain(accountId, domainId);
  }

  @Post(':id/verify')
  @UseGuards(RoleGuard)
  @Roles('owner', 'admin')
  verifyDomain(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.verifyDomain(accountId, domainId);
  }

  // DNS sub-routes
  @Get(':id/dns')
  getDnsRecords(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.getDnsRecords(accountId, domainId);
  }

  @Post(':id/dns/check')
  checkDns(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.checkDns(accountId, domainId);
  }

  // Address sub-routes
  @Get(':id/addresses')
  getAddresses(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
  ) {
    return this.domainsService.getAddresses(accountId, domainId);
  }

  @Post(':id/addresses')
  @UseGuards(RoleGuard)
  @Roles('owner', 'admin')
  createAddress(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.domainsService.createAddress(accountId, domainId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @UseGuards(RoleGuard)
  @Roles('owner', 'admin')
  deleteAddress(
    @CurrentUser('accountId') accountId: string,
    @Param('id') domainId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.domainsService.deleteAddress(accountId, domainId, addressId);
  }
}
