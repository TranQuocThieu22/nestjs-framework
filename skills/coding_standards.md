# Coding Standards

## 1. Enums
- **Always use English for Enum names and keys/values.** This maintains consistency with code and the database.
- **Do not use Vietnamese (with or without accents) for Enum keys or values.**
- **If you need Vietnamese descriptions for UI display**, create a `Record` mapping object alongside the Enum.

**Example:**
```typescript
// NÊN LÀM: Định nghĩa bằng tiếng Anh
export enum DepartmentType {
  SCHOOL = 'SCHOOL',
  FACULTY = 'FACULTY',
  DEPARTMENT = 'DEPARTMENT',
  CENTER = 'CENTER',
  DIVISION = 'DIVISION',
}

// NÊN LÀM: Khai báo object Record để lưu mô tả tiếng Việt
export const DepartmentTypeDescription: Record<DepartmentType, string> = {
  [DepartmentType.SCHOOL]: 'Trường',
  [DepartmentType.FACULTY]: 'Khoa',
  [DepartmentType.DEPARTMENT]: 'Phòng ban',
  [DepartmentType.CENTER]: 'Trung tâm',
  [DepartmentType.DIVISION]: 'Bộ môn',
};
```
