import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ModuleEntity } from './module.entity';
import { ActionEntity } from './action.entity';

@Entity('iam_user_permissions')
export class UserPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' }) // User ID từ Keycloak
  userId: string;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'module_id' })
  module: ModuleEntity;

  @ManyToOne(() => ActionEntity)
  @JoinColumn({ name: 'action_id' })
  action: ActionEntity;

  @Column({ default: false })
  isGranted: boolean;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
