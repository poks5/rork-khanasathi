import React from 'react';

// Performance optimization utilities

// Debounce function for search and other frequent operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Batch AsyncStorage operations
class AsyncStorageBatch {
  private operations: (() => Promise<void>)[] = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;

  add(operation: () => Promise<void>) {
    this.operations.push(operation);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, 100); // Batch operations for 100ms
  }

  private async flush() {
    const ops = [...this.operations];
    this.operations = [];
    this.timeout = null;
    
    try {
      await Promise.all(ops.map(op => op()));
    } catch (error) {
      console.error('Batch AsyncStorage operation failed:', error);
    }
  }
}

export const asyncStorageBatch = new AsyncStorageBatch();

// Lazy component loader
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn);
}

// Memory-efficient array operations
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Optimize object comparisons for React.memo
export function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  
  if (end - start > 16) { // Log if operation takes more than 16ms (1 frame)
    console.log(`Performance: ${name} took ${end - start}ms`);
  }
  
  return result;
}

// Async performance monitoring
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  
  if (end - start > 100) { // Log if async operation takes more than 100ms
    console.log(`Async Performance: ${name} took ${end - start}ms`);
  }
  
  return result;
}