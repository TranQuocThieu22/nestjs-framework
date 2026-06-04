import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Mã nhân sự (cũng dùng làm username)' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'ID đơn vị công tác', required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ description: 'Mã nhóm quyền (Role Code)', required: false })
  @IsString()
  @IsOptional() // Tạm thời Optional vì chưa phát triển
  roleCode?: string;
}
