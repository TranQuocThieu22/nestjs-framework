export interface IActivity {
  id: string;
  code: string;
  name: string;
  semester: string;
  status: string;
}

/**
 * Dữ liệu người dùng đang đăng nhập, được JwtStrategy.validate() gắn vào request.user.
 * Đây là contract nền tảng dùng chung cho toàn hệ thống (auth, controller, guard).
 */
export interface ActiveUserData {
  /** ID người dùng (subject - sub) trong token */
  userId: string;
  /** Tên đăng nhập (preferred_username) */
  username: string;
  /** Danh sách vai trò ở realm */
  roles: string[];
  /** Mã khách hàng (tenant) trích xuất từ issuer URL */
  tenantId: string;
}
