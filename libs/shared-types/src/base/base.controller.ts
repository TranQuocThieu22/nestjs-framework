import {
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  Type,
} from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { Paginate, ApiPaginationQuery, PaginateConfig } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { DeepPartial } from 'typeorm';
import { AbstractTenantEntity } from '../entities/base.entity';
import { AbstractBaseService } from './base.service';

export function BaseControllerFactory<
  Entity extends AbstractTenantEntity,
  CreateDto extends DeepPartial<Entity>,
  UpdateDto extends DeepPartial<Entity>,
>(
  createDtoClass: Type<CreateDto>,
  updateDtoClass: Type<UpdateDto>,
  paginateConfig: PaginateConfig<Entity>,
) {
  abstract class BaseControllerHost {
    constructor(
      protected readonly baseService: AbstractBaseService<
        Entity,
        CreateDto,
        UpdateDto
      >,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Thêm mới' })
    @ApiBody({ type: createDtoClass })
    create(@Req() req: any, @Body() createDto: CreateDto) {
      return this.baseService.create(req.user.tenantId, createDto);
    }

    @Get('flat')
    @ApiOperation({ summary: 'Lấy danh sách dạng phẳng (Không phân trang)' })
    findAllFlat(@Req() req: any) {
      return this.baseService.findAllFlat(req.user.tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách (Có phân trang, search, filter)' })
    @ApiPaginationQuery(paginateConfig)
    findAllPaginated(@Req() req: any, @Paginate() query: PaginateQuery) {
      return this.baseService.findAllPaginated(req.user.tenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết 1 bản ghi' })
    findOne(@Req() req: any, @Param('id') id: string) {
      return this.baseService.findOne(id, req.user.tenantId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật' })
    @ApiBody({ type: updateDtoClass })
    update(
      @Req() req: any,
      @Param('id') id: string,
      @Body() updateDto: UpdateDto,
    ) {
      return this.baseService.update(id, req.user.tenantId, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa (Soft Delete)' })
    remove(@Req() req: any, @Param('id') id: string) {
      return this.baseService.softRemove(id, req.user.tenantId);
    }
  }

  return BaseControllerHost;
}
