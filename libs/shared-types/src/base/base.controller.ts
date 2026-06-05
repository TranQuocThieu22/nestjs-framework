import { Get, Post, Body, Put, Param, Delete, Type, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { Paginate, ApiPaginationQuery, PaginateConfig } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { DeepPartial } from 'typeorm';
import { ActiveUser } from '../decorators/active-user.decorator';
import type { ActiveUserData } from '../interfaces';
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
      public readonly baseService: AbstractBaseService<
        Entity,
        CreateDto,
        UpdateDto
      >,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Thêm mới' })
    @ApiBody({ type: createDtoClass })
    create(
      @ActiveUser() user: ActiveUserData,
      @Body(new ValidationPipe({ transform: true, whitelist: true, expectedType: createDtoClass })) createDto: CreateDto,
    ) {
      return this.baseService.create(user.tenantId, createDto);
    }

    @Get('flat')
    @ApiOperation({ summary: 'Lấy danh sách dạng phẳng (Không phân trang)' })
    findAllFlat(@ActiveUser() user: ActiveUserData) {
      return this.baseService.findAllFlat(user.tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách (Có phân trang, search, filter)' })
    @ApiPaginationQuery(paginateConfig)
    findAllPaginated(
      @ActiveUser() user: ActiveUserData,
      @Paginate() query: PaginateQuery,
    ) {
      return this.baseService.findAllPaginated(user.tenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết 1 bản ghi' })
    findOne(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
      return this.baseService.findOne(id, user.tenantId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật' })
    @ApiBody({ type: updateDtoClass })
    update(
      @ActiveUser() user: ActiveUserData,
      @Param('id') id: string,
      @Body(new ValidationPipe({ transform: true, whitelist: true, expectedType: updateDtoClass })) updateDto: UpdateDto,
    ) {
      return this.baseService.update(id, user.tenantId, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa (Soft Delete)' })
    remove(@ActiveUser() user: ActiveUserData, @Param('id') id: string) {
      return this.baseService.softRemove(id, user.tenantId);
    }
  }

  return BaseControllerHost;
}
