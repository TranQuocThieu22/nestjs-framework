# API Development Guidelines & Standard Operating Procedure (SOP)

This skill file defines the standard way to create new CRUD APIs in this NestJS + TypeORM Multi-Tenant project. 
**When asked to create a new API or Module, ALWAYS follow these instructions to maintain architectural consistency.**

## 0. Folder Structure (Feature Module)
Mỗi nghiệp vụ là **một feature module tự chứa**, không gom theo loại file. Quy ước đặt code:
- Domain dùng chung ≥2 app (tài khoản, đơn vị, niên khóa…) → đặt trong `libs/<domain>/src/modules/<feature>/`.
- Domain riêng của 1 app → đặt trong `apps/<app>/src/modules/<feature>/`.

```
modules/
  position/
    position.module.ts            # khai báo entity + controller + service của feature
    controllers/position.controller.ts
    services/position.service.ts
    entities/position.entity.ts
    dto/position.dto.ts
```
Module tổng của thư viện (vd `system-management.module.ts`) chỉ `imports`/`exports` các feature module con, không tự khai báo controller/service.

## 1. Entity Definition
All new entities that are part of a tenant's data must extend `AbstractTenantEntity`. This automatically provides `id` (UUID), `tenantId`, `createdAt`, `updatedAt`, and `deletedAt` (for soft deletion).

```typescript
import { Entity, Column } from 'typeorm';
import { AbstractTenantEntity } from '@app/shared-types';

@Entity('sys_positions')
export class PositionEntity extends AbstractTenantEntity {
  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
```

## 2. DTO Definition
Use `class-validator` and `class-transformer`. Define a `CreateDto` and an `UpdateDto` using `@nestjs/swagger`'s `PartialType`.

```typescript
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ description: 'Mã chức vụ' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Tên chức vụ' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}
```

## 3. Service Definition
Services must extend `AbstractBaseService` from `@app/shared-types`. You must configure `nestjs-paginate` via the constructor.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterOperator } from 'nestjs-paginate';
import { AbstractBaseService } from '@app/shared-types';
import { PositionEntity } from '../entities/position.entity';
import { CreatePositionDto, UpdatePositionDto } from '../dto/position.dto';

@Injectable()
export class PositionService extends AbstractBaseService<
  PositionEntity,
  CreatePositionDto,
  UpdatePositionDto
> {
  constructor(
    @InjectRepository(PositionEntity)
    repository: Repository<PositionEntity>,
  ) {
    super(
      repository,
      {
        sortableColumns: ['createdAt', 'name', 'code'],
        nullSort: 'last',
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['name', 'code'],
        filterableColumns: {
          code: [FilterOperator.EQ],
        },
      },
      'Chức vụ', // Tên model tiếng việt dùng để báo lỗi
    );
  }
}
```
*Note: Only override `create`, `update`, `softRemove` if custom business logic (like checking for duplicate codes) is needed.*

## 4. Controller Definition
Use the `BaseControllerFactory` Mixin to automatically generate the 5 standard endpoints (`POST /`, `GET /flat`, `GET /` paginated, `GET /:id`, `PUT /:id`, `DELETE /:id`). Apply Swagger and Auth guards globally to the controller.

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/iam';
import { BaseControllerFactory } from '@app/shared-types';
import { PositionEntity } from '../entities/position.entity';
import { CreatePositionDto, UpdatePositionDto } from '../dto/position.dto';
import { PositionService } from '../services/position.service';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';

// Configuration MUST match the service for Swagger to render correctly.
// LUÔN ép kiểu PaginateConfig<Entity> — KHÔNG dùng `as any`.
const paginateConfig: PaginateConfig<PositionEntity> = {
  sortableColumns: ['createdAt', 'name', 'code'],
  searchableColumns: ['name', 'code'],
  filterableColumns: {
    code: [FilterOperator.EQ],
  },
};

@ApiTags('Quản lý Danh mục Chức vụ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/positions')
export class PositionController extends BaseControllerFactory<
  PositionEntity,
  CreatePositionDto,
  UpdatePositionDto
>(CreatePositionDto, UpdatePositionDto, paginateConfig) {
  constructor(private readonly positionService: PositionService) {
    super(positionService);
  }
}
```

## 5. Module Definition
Mỗi feature có file `*.module.ts` riêng, tự khai báo entity/controller/service và import `IamModule` (cho guards):

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '@app/iam';
import { PositionEntity } from './entities/position.entity';
import { PositionController } from './controllers/position.controller';
import { PositionService } from './services/position.service';

@Module({
  imports: [TypeOrmModule.forFeature([PositionEntity]), IamModule],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
```
Sau đó thêm `PositionModule` vào `imports`/`exports` của module tổng (vd `SystemManagementModule`).

## 6. Security and Tenancy
- Never accept `tenantId` from a DTO body. Always extract it via the **`@ActiveUser()`** decorator (`@app/shared-types`, cũng re-export qua `@app/iam`), KHÔNG dùng `@Req() req: any`.
  ```typescript
  findMine(@ActiveUser() user: ActiveUserData) {
    return this.service.findByTenant(user.tenantId);
  }
  // hoặc lấy thẳng 1 trường: @ActiveUser('tenantId') tenantId: string
  ```
- The base classes handle `tenantId` automatically. Only worry about it when writing custom `QueryBuilder` logic.
- Always use `softRemove` instead of `remove` to preserve history and prevent foreign key violations.
- TUYỆT ĐỐI không dùng `any`. Bắt lỗi bằng `catch (error: unknown)` rồi ép kiểu cụ thể.
