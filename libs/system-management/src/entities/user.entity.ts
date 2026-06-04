import { Entity, Column } from 'typeorm';
import { AbstractTenantEntity } from '@app/shared-types';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('sys_users')
export class UserEntity extends AbstractTenantEntity {
  @Column({ name: 'employee_code', unique: true }) // Mã nhân sự
  employeeCode: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;
}
