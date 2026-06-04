import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DepartmentType } from '../entities/department.entity';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Mã đơn vị', example: 'K_CNTT' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Tên đơn vị',
    example: 'Khoa Công nghệ thông tin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Trực thuộc đơn vị (ID)', required: false })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Loại đơn vị',
    enum: DepartmentType,
    example: DepartmentType.KHOA,
  })
  @IsEnum(DepartmentType)
  @IsNotEmpty()
  type: DepartmentType;

  @ApiProperty({ description: 'Ghi chú / Mô tả', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
