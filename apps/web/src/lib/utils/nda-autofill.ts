/**
 * Merge NDA template auto-fill values (party names, dates, etc.) into
 * the editor's current variable map.
 *
 * Empty auto-fill values are ignored so a blank Parties field does not
 * wipe a value the user typed in the template-variable inputs.
 * Non-empty auto-fill values always win for that key — the Book a Meeting
 * "NDA Parties" card is the source of truth for party names.
 */
export function applyNdaAutoFill(
  current: Record<string, string>,
  autoFill?: Record<string, string>,
): Record<string, string> {
  if (!autoFill) return current;

  let changed = false;
  const next = { ...current };
  for (const [key, value] of Object.entries(autoFill)) {
    if (value && next[key] !== value) {
      next[key] = value;
      changed = true;
    }
  }
  return changed ? next : current;
}

/** Stable identity for auto-fill maps so effects do not re-run on new object identity. */
export function ndaAutoFillKey(autoFill?: Record<string, string>): string {
  return JSON.stringify(autoFill ?? {});
}
