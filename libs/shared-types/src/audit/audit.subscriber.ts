import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SoftRemoveEvent,
  RecoverEvent,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditLogEntity } from './audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly systemFields = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'version',
  ];

  constructor(
    private readonly dataSource: DataSource,
    private readonly clsService: ClsService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  private getActiveUser() {
    return this.clsService.get('user');
  }

  /**
   * Lọc bỏ các trường hệ thống để Frontend không bị rác
   */
  private scrubSystemFields(entity: any): any {
    if (!entity) return null;
    const clean = { ...entity };
    for (const field of this.systemFields) {
      delete clean[field];
    }
    return clean;
  }

  /**
   * So sánh và trả về danh sách các trường bị thay đổi
   */
  private getChangedFields(oldData: any, newData: any): string[] {
    const changes: string[] = [];
    if (!oldData || !newData) return changes;

    const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    keys.forEach((key) => {
      // Bỏ qua các trường hệ thống
      if (this.systemFields.includes(key)) return;

      if (oldData[key] !== newData[key]) {
        changes.push(key);
      }
    });
    return changes;
  }

  async beforeInsert(event: InsertEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const user = this.getActiveUser();
    if (user && event.entity) {
      const hasCreatedBy = event.metadata.columns.some(col => col.propertyName === 'createdBy');
      const hasUpdatedBy = event.metadata.columns.some(col => col.propertyName === 'updatedBy');
      
      if (hasCreatedBy) {
        event.entity.createdBy = user.userId;
      }
      if (hasUpdatedBy) {
        event.entity.updatedBy = user.userId;
      }
    }
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id;
    log.action = 'CREATE';
    
    const cleanNew = this.scrubSystemFields(event.entity);
    log.newValues = cleanNew;
    log.changedFields = Object.keys(cleanNew || {});
    
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const user = this.getActiveUser();
    if (user && event.entity) {
      const hasUpdatedBy = event.metadata.columns.some(col => col.propertyName === 'updatedBy');
      if (hasUpdatedBy) {
        event.entity.updatedBy = user.userId;
      }
    }
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;
    if (!event.entity) return;

    const cleanOld = this.scrubSystemFields(event.databaseEntity);
    const cleanNew = this.scrubSystemFields(event.entity);
    const changedFields = this.getChangedFields(cleanOld, cleanNew);

    // Nếu không có field nào ngoài system field bị sửa, có thể bỏ qua không log (tùy nghiệp vụ)
    // if (changedFields.length === 0) return;

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'UPDATE';
    log.oldValues = cleanOld;
    log.newValues = cleanNew;
    log.changedFields = changedFields;
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const cleanOld = this.scrubSystemFields(event.entity || event.databaseEntity);

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'DELETE';
    log.oldValues = cleanOld;
    log.changedFields = Object.keys(cleanOld || {});
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }

  async afterSoftRemove(event: SoftRemoveEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const cleanOld = this.scrubSystemFields(event.entity || event.databaseEntity);

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'SOFT_DELETE';
    log.oldValues = cleanOld;
    log.changedFields = Object.keys(cleanOld || {});
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }

  async afterRecover(event: RecoverEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const cleanOld = this.scrubSystemFields(event.entity || event.databaseEntity);

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'RESTORE';
    log.newValues = cleanOld; // When restoring, the old values become the current valid values
    log.changedFields = Object.keys(cleanOld || {});
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }
}
