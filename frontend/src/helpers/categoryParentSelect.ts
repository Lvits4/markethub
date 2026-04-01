import type { Category } from '../types/category';

/** IDs de la categoría en edición y de todos sus descendientes (no válidos como padre). */
export function excludedParentIdsForEdit(
  editingId: string,
  flat: Category[],
): Set<string> {
  const byParent = new Map<string | null, string[]>();
  for (const c of flat) {
    const pid = c.parentId ?? null;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(c.id);
  }
  const out = new Set<string>();
  const walk = (id: string) => {
    out.add(id);
    for (const childId of byParent.get(id) ?? []) walk(childId);
  };
  walk(editingId);
  return out;
}
