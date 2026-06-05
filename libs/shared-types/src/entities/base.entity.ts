import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  VersionColumn,
} from 'typeorm';

export abstract class AbstractBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @VersionColumn()
  version: number;
}

export abstract class AbstractTenantEntity extends AbstractBaseEntity {
  @Column({ name: 'tenant_id', type: 'varchar', length: 100 })
  tenantId: string; // ID của Đơn vị chủ quản (Ví dụ: dhvb)
}
