/**
 * Utility functions for Firestore operations
 */

/**
 * Recursively cleans any object or array before writing to Firestore.
 * - Removes undefined keys from objects
 * - Converts undefined values in arrays or top-level to null/filtered
 * - Preserves Date, Timestamp, FieldValue, null, and primitives
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  // Preserve Date instances
  if (data instanceof Date) {
    return data;
  }
  // Preserve Firestore Timestamp or FieldValue objects
  if ('toDate' in data && typeof (data as any).toDate === 'function') {
    return data;
  }
  if ('_methodName' in data || ('type' in data && (data as any).type === 'FieldValue')) {
    return data;
  }
  // Handle Array
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  // Handle Plain Object
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = (data as Record<string, any>)[key];
    if (val !== undefined) {
      sanitized[key] = sanitizeFirestoreData(val);
    }
  }
  return sanitized as T;
}
