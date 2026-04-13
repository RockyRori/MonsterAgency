import type { InventoryEntry } from "./types";

export function normalizeInventory(
  inventory: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {};

  Object.entries(inventory).forEach(([itemId, quantity]) => {
    if (quantity > 0) {
      next[itemId] = Math.floor(quantity);
    }
  });

  return next;
}

export function hasInventory(
  inventory: Record<string, number>,
  requirements: InventoryEntry[],
): boolean {
  return requirements.every(
    ({ itemId, quantity }) => (inventory[itemId] ?? 0) >= quantity,
  );
}

export function addInventoryEntries(
  inventory: Record<string, number>,
  entries: InventoryEntry[],
): Record<string, number> {
  const next = { ...inventory };

  entries.forEach(({ itemId, quantity }) => {
    next[itemId] = (next[itemId] ?? 0) + quantity;
  });

  return normalizeInventory(next);
}

export function removeInventoryEntries(
  inventory: Record<string, number>,
  entries: InventoryEntry[],
): Record<string, number> {
  const next = { ...inventory };

  entries.forEach(({ itemId, quantity }) => {
    next[itemId] = (next[itemId] ?? 0) - quantity;
  });

  return normalizeInventory(next);
}

export function mergeInventoryEntries(
  entries: InventoryEntry[],
): InventoryEntry[] {
  const merged = new Map<string, number>();

  entries.forEach(({ itemId, quantity }) => {
    merged.set(itemId, (merged.get(itemId) ?? 0) + quantity);
  });

  return [...merged.entries()]
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }));
}
