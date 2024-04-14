export function sanitize<T>(obj: T, keysToRemove: Array<keyof T>): Partial<T> {
  const newObj = { ...obj };
  keysToRemove.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
}
