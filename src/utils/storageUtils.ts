// src/utils/storageUtils.ts
/**
 * Utility functions for working with localStorage
 */

/**
 * Get data from localStorage with type safety
 * @param key The localStorage key
 * @param defaultValue Default value if key doesn't exist
 * @returns The parsed data or default value
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage
 * @param key The localStorage key
 * @param value The value to save
 * @returns true if successful, false otherwise
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param key The localStorage key
 * @returns true if successful, false otherwise
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param key The localStorage key
 * @returns true if key exists, false otherwise
 */
export function existsInStorage(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * Update a specific item in an array stored in localStorage
 * @param key The localStorage key
 * @param id The id of the item to update
 * @param idField The field name for the id (default: 'id')
 * @param updateFn Function that takes the old item and returns the updated item
 * @returns true if successful, false otherwise
 */
export function updateItemInStorage<T>(
  key: string,
  id: string,
  updateFn: (oldItem: T) => T,
  idField: keyof T = 'id' as keyof T
): boolean {
  try {
    const items = getFromStorage<T[]>(key, []);
    const updatedItems = items.map(item => 
      (item[idField] as unknown as string) === id ? updateFn(item) : item
    );
    return saveToStorage(key, updatedItems);
  } catch (error) {
    console.error(`Error updating item in ${key}:`, error);
    return false;
  }
}