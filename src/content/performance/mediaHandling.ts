import { GuidelineEntry } from '../../types';

/**
 * Media Handling Guidelines
 * Compression and lazy loading requirements for optimal media performance
 */

export const mediaHandlingGuidelines: GuidelineEntry = {
  id: 'performance-media-handling',
  title: 'Media Handling Guidelines',
  category: 'performance',
  priority: 'critical',
  description: 'Guidelines for optimizing images, videos, and other media assets through compression, lazy loading, and efficient delivery techniques.',
  rules: [
    {
      statement: 'Implement lazy loading for images and videos',
      rationale: 'Lazy loading defers loading of off-screen media until needed, reducing initial page load time and bandwidth usage.',
      implementation: 'Use native loading="lazy" attribute for images, implement Intersection Observer for custom lazy loading, and defer video loading until user interaction.',
      validation: {
        method: 'performance-testing',
        automated: true,
        tools: ['lazy-loading-checker', 'lighthouse-audit']
      }
    },

    {
      statement: 'Use modern image formats with fallbacks',
      rationale: 'Modern formats like WebP and AVIF provide better compression ratios while maintaining quality, significantly reducing file sizes.',
      implementation: 'Serve AVIF/WebP formats to supporting browsers with JPEG/PNG fallbacks using picture element or server-side content negotiation.',
      validation: {
        method: 'format-support-testing',
        automated: true,
        tools: ['image-format-analyzer']
      }
    },

    {
      statement: 'Optimize image compression and quality settings',
      rationale: 'Proper compression reduces file sizes without noticeable quality loss, improving load times and reducing bandwidth costs.',
      implementation: 'Use quality settings of 80-85% for JPEG, optimize PNG with tools like pngquant, and implement progressive JPEG for large images.',
      validation: {
        method: 'image-quality-analysis',
        automated: true,
        tools: ['image-compression-analyzer']
      }
    },

    {
      statement: 'Implement responsive images with appropriate sizing',
      rationale: 'Serving appropriately sized images for different devices prevents downloading unnecessarily large files on smaller screens.',
      implementation: 'Use srcset and sizes attributes to provide multiple image resolutions, implement art direction with picture element when needed.',
      validation: {
        method: 'responsive-image-testing',
        automated: true,
        tools: ['responsive-image-checker']
      }
    },

    {
      statement: 'Optimize video delivery and streaming',
      rationale: 'Video files are typically the largest assets on a page, requiring careful optimization to maintain performance.',
      implementation: 'Use appropriate video codecs (H.264, H.265, VP9), implement adaptive streaming, provide poster images, and use preload attributes strategically.',
      validation: {
        method: 'video-performance-testing',
        automated: true,
        tools: ['video-optimization-checker']
      }
    }
  ],
  examples: [
    {
      language: 'html',
      title: 'Lazy Loading Implementation',
      goodExample: `<!-- Good: Native lazy loading with fallback -->
<img 
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  srcset="image-320.jpg 320w,
          image-640.jpg 640w,
          image-1024.jpg 1024w"
  sizes="(max-width: 320px) 280px,
         (max-width: 640px) 600px,
         1024px"
  alt="Descriptive alt text"
  loading="lazy"
  decoding="async"
  class="lazy-image">

<!-- Video with lazy loading -->
<video 
  poster="video-poster.jpg"
  preload="none"
  controls
  class="lazy-video"
  data-src="video.mp4">
  <source data-src="video.webm" type="video/webm">
  <source data-src="video.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>

<script>
// Intersection Observer for enhanced lazy loading
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      
      // Load the actual image
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      
      // Update srcset if present
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      }
      
      img.classList.remove('lazy-image');
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px 0px' // Start loading 50px before entering viewport
});

// Observe all lazy images
document.querySelectorAll('.lazy-image').forEach(img => {
  imageObserver.observe(img);
});
</script>`,
      badExample: `<!-- Bad: All images load immediately -->
<img src="large-image-1024.jpg" alt="Image">
<img src="another-large-image.jpg" alt="Another image">
<img src="third-large-image.jpg" alt="Third image">

<!-- Video loads immediately -->
<video autoplay controls>
  <source src="large-video.mp4" type="video/mp4">
</video>`,
      explanation: 'The good example implements lazy loading with Intersection Observer, provides responsive images, and defers video loading. The bad example loads all media immediately, impacting initial page performance.'
    },

    {
      language: 'html',
      title: 'Modern Image Formats with Fallbacks',
      goodExample: `<!-- Good: Modern formats with progressive fallbacks -->
<picture>
  <!-- AVIF for maximum compression -->
  <source 
    srcset="hero-320.avif 320w,
            hero-640.avif 640w,
            hero-1024.avif 1024w,
            hero-1920.avif 1920w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    type="image/avif">
  
  <!-- WebP for good compression and wide support -->
  <source 
    srcset="hero-320.webp 320w,
            hero-640.webp 640w,
            hero-1024.webp 1024w,
            hero-1920.webp 1920w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    type="image/webp">
  
  <!-- JPEG fallback for universal support -->
  <img 
    src="hero-1024.jpg"
    srcset="hero-320.jpg 320w,
            hero-640.jpg 640w,
            hero-1024.jpg 1024w,
            hero-1920.jpg 1920w"
    sizes="(max-width: 768px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
    alt="Hero section background"
    loading="lazy"
    decoding="async">
</picture>

<!-- CSS for progressive enhancement -->
<style>
.hero-image {
  background-image: url('hero-1024.jpg');
  
  /* WebP support */
  @supports (background-image: url('image.webp')) {
    background-image: url('hero-1024.webp');
  }
  
  /* AVIF support (future-proofing) */
  @supports (background-image: url('image.avif')) {
    background-image: url('hero-1024.avif');
  }
}
</style>`,
      badExample: `<!-- Bad: Only JPEG format -->
<img src="hero-large.jpg" alt="Hero image">

<!-- Bad: Only modern format without fallback -->
<img src="hero.webp" alt="Hero image">`,
      explanation: 'The good example provides multiple formats in order of efficiency with proper fallbacks, ensuring optimal compression for supporting browsers while maintaining compatibility. The bad examples either miss optimization opportunities or break compatibility.'
    },

    {
      language: 'javascript',
      title: 'Advanced Image Optimization',
      goodExample: `// Good: Comprehensive image optimization system
class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectFormatSupport();
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.connectionSpeed = this.detectConnectionSpeed();
  }
  
  detectFormatSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
    };
  }
  
  detectConnectionSpeed() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        saveData: connection.saveData
      };
    }
    return { effectiveType: '4g', downlink: 10, saveData: false };
  }
  
  getOptimalImageUrl(baseUrl, width, options = {}) {
    const { quality = 'auto', format = 'auto' } = options;
    
    // Adjust width for device pixel ratio
    const targetWidth = Math.ceil(width * this.devicePixelRatio);
    
    // Choose format based on support and connection
    let selectedFormat = 'jpg';
    if (format === 'auto') {
      if (this.supportedFormats.avif && this.connectionSpeed.effectiveType !== '2g') {
        selectedFormat = 'avif';
      } else if (this.supportedFormats.webp) {
        selectedFormat = 'webp';
      }
    }
    
    // Adjust quality based on connection and save-data preference
    let selectedQuality = 85;
    if (quality === 'auto') {
      if (this.connectionSpeed.saveData || this.connectionSpeed.effectiveType === '2g') {
        selectedQuality = 70;
      } else if (this.connectionSpeed.effectiveType === '3g') {
        selectedQuality = 80;
      }
    }
    
    return \`\${baseUrl}?w=\${targetWidth}&f=\${selectedFormat}&q=\${selectedQuality}\`;
  }
  
  preloadCriticalImages(imageUrls) {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
  
  setupProgressiveLoading(img, highResUrl) {
    // Load low-quality placeholder first
    const lowResUrl = this.getOptimalImageUrl(highResUrl, 50, { quality: 30 });
    
    img.src = lowResUrl;
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.3s';
    
    // Load high-quality image
    const highResImg = new Image();
    highResImg.onload = () => {
      img.src = highResUrl;
      img.style.filter = 'none';
    };
    highResImg.src = highResUrl;
  }
}

// Usage
const optimizer = new ImageOptimizer();

// Optimize images based on viewport and device capabilities
document.querySelectorAll('.responsive-image').forEach(img => {
  const rect = img.getBoundingClientRect();
  const optimalUrl = optimizer.getOptimalImageUrl(
    img.dataset.baseUrl,
    rect.width
  );
  
  if (img.dataset.critical === 'true') {
    optimizer.preloadCriticalImages([optimalUrl]);
  }
  
  if (img.dataset.progressive === 'true') {
    optimizer.setupProgressiveLoading(img, optimalUrl);
  } else {
    img.src = optimalUrl;
  }
});`,
      badExample: `// Bad: No optimization or adaptation
document.querySelectorAll('img').forEach(img => {
  // Always load full-size image
  img.src = img.dataset.src;
});

// No format detection
// No connection speed consideration
// No progressive loading
// No preloading strategy`,
      explanation: 'The good example implements a comprehensive image optimization system that adapts to device capabilities, connection speed, and user preferences. The bad example loads images without any optimization or adaptation.'
    },

    {
      language: 'html',
      title: 'Optimized Video Implementation',
      goodExample: `<!-- Good: Optimized video with multiple formats and adaptive loading -->
<video 
  class="hero-video"
  poster="video-poster.jpg"
  preload="metadata"
  muted
  playsinline
  controls>
  
  <!-- Modern, efficient formats first -->
  <source src="video-1080p.av1.mp4" type="video/mp4; codecs=av01.0.08M.10.0.110.09" media="(min-width: 1024px)">
  <source src="video-720p.av1.mp4" type="video/mp4; codecs=av01.0.05M.10.0.110.09" media="(max-width: 1023px)">
  
  <!-- VP9 fallback -->
  <source src="video-1080p.webm" type="video/webm; codecs=vp9,opus" media="(min-width: 1024px)">
  <source src="video-720p.webm" type="video/webm; codecs=vp9,opus" media="(max-width: 1023px)">
  
  <!-- H.264 fallback for wide compatibility -->
  <source src="video-1080p.mp4" type="video/mp4; codecs=avc1.640028,mp4a.40.2" media="(min-width: 1024px)">
  <source src="video-720p.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">
  
  <!-- Fallback message -->
  <p>Your browser doesn't support video playback. 
     <a href="video-720p.mp4">Download the video</a> instead.</p>
</video>

<script>
// Adaptive video loading based on connection
class VideoOptimizer {
  constructor() {
    this.connection = navigator.connection || { effectiveType: '4g' };
    this.prefersReducedData = this.connection.saveData || 
                              this.connection.effectiveType === '2g' ||
                              this.connection.effectiveType === 'slow-2g';
  }
  
  optimizeVideo(video) {
    if (this.prefersReducedData) {
      // Disable autoplay and preload for slow connections
      video.preload = 'none';
      video.removeAttribute('autoplay');
      
      // Show play button overlay
      this.addPlayButton(video);
    } else {
      // Enable optimizations for fast connections
      video.preload = 'metadata';
      
      // Intersection observer for autoplay
      this.setupAutoplay(video);
    }
  }
  
  addPlayButton(video) {
    const playButton = document.createElement('button');
    playButton.className = 'video-play-button';
    playButton.innerHTML = '▶ Play Video';
    playButton.onclick = () => {
      video.play();
      playButton.style.display = 'none';
    };
    
    video.parentNode.insertBefore(playButton, video.nextSibling);
  }
  
  setupAutoplay(video) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          video.play().catch(() => {
            // Autoplay failed, show play button
            this.addPlayButton(video);
          });
          observer.unobserve(video);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(video);
  }
}

// Initialize video optimization
const videoOptimizer = new VideoOptimizer();
document.querySelectorAll('video').forEach(video => {
  videoOptimizer.optimizeVideo(video);
});
</script>`,
      badExample: `<!-- Bad: Single format, no optimization -->
<video autoplay loop muted>
  <source src="large-video.mp4" type="video/mp4">
</video>

<!-- Bad: Preloads entire video -->
<video preload="auto" controls>
  <source src="huge-video.mp4" type="video/mp4">
</video>`,
      explanation: 'The good example provides multiple video formats optimized for different devices and connection speeds, with adaptive loading strategies. The bad examples waste bandwidth by loading large videos without optimization or user consideration.'
    }
  ],
  relatedGuidelines: [
    'performance-asset-optimization',
    'performance-responsive-design',
    'accessibility-compliance'
  ]
};