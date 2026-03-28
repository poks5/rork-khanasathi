import { Platform } from 'react-native';

export const performanceConfig = {
  // Image optimization settings
  imageOptimization: {
    quality: 85,
    format: 'webp',
    fallback: 'jpg',
    sizes: [320, 640, 768, 1024, 1280, 1920],
    placeholder: 'blur'
  },
  
  // Lazy loading configuration
  lazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
    triggerOnce: true
  },
  
  // Cache configuration
  cache: {
    maxAge: 86400, // 24 hours
    staleWhileRevalidate: 3600, // 1 hour
    maxEntries: 100
  },
  
  // Bundle optimization
  bundleOptimization: {
    splitChunks: true,
    treeshaking: true,
    minification: true,
    compression: 'gzip'
  }
};

// Web-specific performance optimizations
export const initializeWebPerformance = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  
  // Preload critical resources
  const preloadResources = [
    { href: '/assets/images/icon.png', as: 'image' },
    { href: '/assets/images/favicon.png', as: 'image' }
  ];
  
  preloadResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
  
  // Add resource hints
  const resourceHints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//toolkit.rork.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
  ];
  
  resourceHints.forEach(({ rel, href, crossorigin }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  });
  
  // Service Worker registration for caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // Critical CSS inlining
  const criticalCSS = `
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #ffffff;
    }
    
    .loading-spinner::after {
      content: '';
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

// Performance monitoring
export const trackWebVitals = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  
  // Track Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const perfEntry = entry as any; // Web Vitals entries have additional properties
      console.log(`${entry.name}: ${perfEntry.value || entry.duration || 'N/A'}`);
      
      // You can send these metrics to your analytics service
      // analytics.track('web_vital', {
      //   name: entry.name,
      //   value: perfEntry.value || entry.duration,
      //   rating: perfEntry.rating
      // });
    });
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch {
    // Fallback for browsers that don't support all entry types
    console.warn('Performance Observer not fully supported');
  }
};

// Image optimization helper
export const optimizeImageUrl = (url: string, width?: number, quality?: number): string => {
  if (Platform.OS !== 'web') return url;
  
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (quality) params.set('q', quality.toString());
  
  // If using a CDN service like Cloudinary or similar
  // return `${url}?${params.toString()}`;
  
  return url;
};

// Lazy loading helper for images
export const createIntersectionObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  
  const options = {
    rootMargin: performanceConfig.lazyLoading.rootMargin,
    threshold: performanceConfig.lazyLoading.threshold
  };
  
  return new IntersectionObserver(callback, options);
};