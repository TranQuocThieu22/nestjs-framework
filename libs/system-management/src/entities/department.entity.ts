import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepartmentType {
  TRUONG = 'TRUONG',
  KHOA = 'KHOA',
  PHONG = 'PHONG',
  TRUNG_TAM = 'TRUNG_TAM',
  BO_MON = 'BO_MON',
}

@Entity('sys_departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 100 })
  tenantId: string; // ID của Đơn vị chủ quản (Ví dụ: dhvb)

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string; // Tự chiếu tới id của sys_departments

  @Column({ type: 'enum', enum: DepartmentType })
  type: DepartmentType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
