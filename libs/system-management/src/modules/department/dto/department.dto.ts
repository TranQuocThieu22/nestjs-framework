import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
} from 'class-validator';
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
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Loại đơn vị',
    enum: DepartmentType,
    example: DepartmentType.FACULTY,
  })
  @IsEnum(DepartmentType)
  @IsNotEmpty()
  type: DepartmentType;

  @ApiProperty({ description: 'Ghi chú / Mô tả', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty({ description: 'Phiên bản (Optimistic Lock)', example: 1 })
  @IsInt()
  @IsNotEmpty()
  version: number;
}
