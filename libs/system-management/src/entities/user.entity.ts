import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('sys_users')
export class UserEntity {
  @PrimaryColumn('uuid') // ID này sẽ được đồng bộ từ Keycloak
  id: string;

  @Column({ name: 'tenant_id' }) // Phân lập đa khách hàng
  tenantId: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
