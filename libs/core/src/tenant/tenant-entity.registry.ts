export class TenantEntityRegistry {
  private static entities: Function[] = [];

  /**
   * Đăng ký các Entity thuộc về Tenant Database.
   * Nên được gọi ở cấp độ module (top-level hoặc trong constructor của Module).
   */
  static register(entities: Function[]) {
    this.entities.push(...entities);
  }

  static getEntities(): Function[] {
    return this.entities;
  }
}
