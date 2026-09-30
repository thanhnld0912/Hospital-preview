/**
 * Tạo mệnh đề SET cho câu UPDATE từ các cột được phép (tên cột luôn do code định nghĩa,
 * giá trị luôn truyền qua tham số $n). Bỏ qua các trường undefined (không cập nhật).
 */
export function buildUpdateSet(columns: Record<string, unknown>): { assignments: string[]; values: unknown[] } {
  const assignments: string[] = [];
  const values: unknown[] = [];
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue;
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  }
  return { assignments, values };
}
