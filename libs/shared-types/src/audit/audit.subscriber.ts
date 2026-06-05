import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditLogEntity } from './audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clsService: ClsService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  /**
   * Listen to all entities.
   */
  // listenTo() {
  //   return AbstractBaseEntity;
  // }
  // We can listen to everything, but ignore AuditLogEntity itself.

  private getActiveUser() {
    return this.clsService.get('user');
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
    log.newValues = event.entity;
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

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'UPDATE';
    log.oldValues = event.databaseEntity;
    log.newValues = event.entity;
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.targetName === 'AuditLogEntity') return;

    const user = this.getActiveUser();
    const log = new AuditLogEntity();
    log.entityName = event.metadata.targetName;
    log.entityId = event.entity?.id || event.databaseEntity?.id;
    log.action = 'DELETE';
    log.oldValues = event.databaseEntity;
    log.userId = user?.userId || null;
    log.tenantId = user?.tenantId || null;

    if (log.entityId) {
      await event.manager.save(AuditLogEntity, log);
    }
  }
}
