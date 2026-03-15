import { GuidelineEntry } from '../../types';

/**
 * Multimedia Accessibility Guidelines
 * Alternative text and caption standards for multimedia content
 */

export const multimediaAccessibility: GuidelineEntry = {
  id: 'accessibility-multimedia',
  title: 'Multimedia Accessibility Guidelines',
  category: 'accessibility',
  priority: 'critical',
  description: 'Comprehensive guidelines for making multimedia content accessible through alternative text, captions, transcripts, and audio descriptions for users with sensory impairments. These caption standards ensure multimedia accessibility.',
  rules: [
    {
      statement: 'All images must have appropriate alternative text that conveys their purpose and content',
      rationale: 'Screen readers rely on alt text to describe images to visually impaired users. The alt text should convey the same information the image provides.',
      implementation: 'Use descriptive alt attributes for informative images, empty alt="" for decorative images, and detailed descriptions for complex images.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['alt-text-checker', 'axe-core', 'WAVE']
      }
    },

    {
      statement: 'Videos must include synchronized captions for all spoken content and important audio information',
      rationale: 'Captions provide access to audio content for deaf and hard-of-hearing users, and benefit users in noisy environments.',
      implementation: 'Provide closed captions using WebVTT format, include speaker identification, sound effects, and music descriptions.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['caption-quality-review', 'accessibility-testing']
      }
    },

    {
      statement: 'Audio content must have text transcripts available',
      rationale: 'Transcripts provide access to audio content for deaf users and allow content to be searchable and translatable.',
      implementation: 'Provide complete transcripts that include all spoken content, speaker identification, and relevant sound descriptions.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['transcript-completeness-review']
      }
    },

    {
      statement: 'Videos with important visual information must include audio descriptions',
      rationale: 'Audio descriptions provide access to visual content for blind and visually impaired users by describing visual elements.',
      implementation: 'Add audio descriptions during natural pauses or provide extended audio description tracks for complex visual content.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['audio-description-review']
      }
    },

    {
      statement: 'Media players must be keyboard accessible and provide accessible controls',
      rationale: 'Users who cannot use a mouse must be able to control media playback using keyboard navigation.',
      implementation: 'Ensure all media controls are focusable, provide keyboard shortcuts, and include accessible labels for all controls.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['keyboard-navigation-testing', 'screen-reader-testing']
      }
    },

    {
      statement: 'Auto-playing media must not include audio or provide controls to stop it',
      rationale: 'Auto-playing audio can interfere with screen readers and be disorienting for users with cognitive disabilities.',
      implementation: 'Avoid auto-playing audio, or provide prominent controls to pause, stop, or mute within 3 seconds of start.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['auto-play-detector', 'media-accessibility-audit']
      }
    },

    {
      statement: 'Complex images like charts and diagrams must have detailed text alternatives',
      rationale: 'Simple alt text is insufficient for complex images; detailed descriptions ensure all users can access the information.',
      implementation: 'Use long descriptions via aria-describedby, provide data tables for charts, or include detailed text explanations.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['complex-image-review', 'data-accessibility-audit']
      }
    }
  ],
  examples: [
    {
      language: 'html',
      title: 'Accessible Image Implementation',
      goodExample: `<!-- Informative image with descriptive alt text -->
<img src="sales-chart-q2-2024.png" 
     alt="Bar chart showing 25% increase in sales from Q1 to Q2 2024, rising from $100,000 to $125,000">

<!-- Decorative image properly marked -->
<img src="decorative-divider.png" alt="" role="presentation">

<!-- Complex image with detailed description -->
<figure>
  <img src="website-architecture-diagram.png" 
       alt="Website architecture diagram" 
       aria-describedby="arch-description">
  <figcaption id="arch-description">
    <h3>Website Architecture Description</h3>
    <p>The diagram shows a three-tier architecture with:</p>
    <ul>
      <li>Presentation layer: React frontend components</li>
      <li>Application layer: Node.js API server with Express</li>
      <li>Data layer: PostgreSQL database with Redis cache</li>
    </ul>
    <p>Arrows indicate data flow from user interactions through the API to the database.</p>
  </figcaption>
</figure>

<!-- Image as functional element -->
<button type="button" aria-label="Close dialog" class="close-button">
  <img src="close-icon.svg" alt="" role="presentation">
</button>

<!-- Image with caption -->
<figure>
  <img src="team-photo.jpg" 
       alt="Five team members standing in front of the office building, smiling at the camera">
  <figcaption>
    Development team at the annual company retreat, March 2024
  </figcaption>
</figure>`,
      badExample: `<!-- Missing alt text -->
<img src="sales-chart.png">

<!-- Redundant or poor alt text -->
<img src="chart.png" alt="chart">
<img src="photo.jpg" alt="photo.jpg">
<img src="diagram.png" alt="image">

<!-- Decorative image with unnecessary alt text -->
<img src="border.png" alt="decorative border image">

<!-- Complex chart without proper description -->
<img src="complex-data-visualization.png" alt="chart">`,
      explanation: 'Good examples provide meaningful, descriptive alt text appropriate to the image context and purpose. Bad examples lack alt text or provide redundant, meaningless descriptions.'
    },

    {
      language: 'html',
      title: 'Accessible Video with Captions and Descriptions',
      goodExample: `<!-- Video with comprehensive accessibility features -->
<figure>
  <video controls 
         width="640" 
         height="360"
         poster="video-thumbnail.jpg"
         aria-describedby="video-description">
    
    <!-- Multiple video formats for compatibility -->
    <source src="tutorial-video.mp4" type="video/mp4">
    <source src="tutorial-video.webm" type="video/webm">
    
    <!-- Captions in multiple languages -->
    <track kind="captions" 
           src="captions-en.vtt" 
           srclang="en" 
           label="English Captions" 
           default>
    <track kind="captions" 
           src="captions-es.vtt" 
           srclang="es" 
           label="Spanish Captions">
    
    <!-- Audio descriptions -->
    <track kind="descriptions" 
           src="audio-descriptions-en.vtt" 
           srclang="en" 
           label="Audio Descriptions">
    
    <!-- Subtitles for translation -->
    <track kind="subtitles" 
           src="subtitles-fr.vtt" 
           srclang="fr" 
           label="French Subtitles">
    
    <!-- Fallback content -->
    <p>Your browser doesn't support HTML5 video. 
       <a href="tutorial-video.mp4">Download the video</a> instead.</p>
  </video>
  
  <figcaption id="video-description">
    <h3>Tutorial: Setting Up Development Environment</h3>
    <p><strong>Duration:</strong> 5 minutes 30 seconds</p>
    <p><strong>Description:</strong> This video demonstrates how to install and configure 
       a development environment for web development, including Node.js installation, 
       VS Code setup, and creating your first project.</p>
  </figcaption>
</figure>

<!-- Transcript section -->
<section aria-labelledby="transcript-heading">
  <h3 id="transcript-heading">Video Transcript</h3>
  <div class="transcript">
    <p><strong>[0:00]</strong> <em>Instructor:</em> Welcome to this tutorial on setting up your development environment.</p>
    <p><strong>[0:05]</strong> <em>Instructor:</em> First, we'll download Node.js from the official website.</p>
    <p><strong>[0:10]</strong> <em>[Sound effect: Mouse clicking]</em></p>
    <p><strong>[0:12]</strong> <em>Instructor:</em> Click on the download button for your operating system...</p>
    <!-- Continue with complete transcript -->
  </div>
</section>`,
      badExample: `<!-- Video without accessibility features -->
<video autoplay controls>
  <source src="video.mp4" type="video/mp4">
</video>

<!-- Video with minimal accessibility -->
<video controls>
  <source src="tutorial.mp4" type="video/mp4">
  <!-- No captions, descriptions, or transcript -->
</video>

<!-- Auto-playing video with sound -->
<video autoplay muted loop>
  <source src="background-video.mp4" type="video/mp4">
  <!-- Auto-plays but user can't easily stop it -->
</video>`,
      explanation: 'Good example includes captions, audio descriptions, transcripts, and proper labeling. Bad examples lack accessibility features and may auto-play inappropriately.'
    },

    {
      language: 'html',
      title: 'Accessible Audio Content',
      goodExample: `<!-- Audio with comprehensive accessibility -->
<figure>
  <audio controls aria-describedby="audio-description">
    <source src="podcast-episode-1.mp3" type="audio/mpeg">
    <source src="podcast-episode-1.ogg" type="audio/ogg">
    
    <!-- Fallback for unsupported browsers -->
    <p>Your browser doesn't support HTML5 audio. 
       <a href="podcast-episode-1.mp3">Download the audio file</a> instead.</p>
  </audio>
  
  <figcaption id="audio-description">
    <h3>Podcast Episode 1: Introduction to Web Accessibility</h3>
    <p><strong>Duration:</strong> 25 minutes</p>
    <p><strong>Host:</strong> Sarah Johnson</p>
    <p><strong>Guest:</strong> Dr. Michael Chen, Accessibility Expert</p>
    <p><strong>Description:</strong> Discussion about the importance of web accessibility, 
       common barriers users face, and practical tips for developers.</p>
  </figcaption>
</figure>

<!-- Complete transcript -->
<section aria-labelledby="audio-transcript-heading">
  <h3 id="audio-transcript-heading">Episode Transcript</h3>
  <div class="transcript">
    <p><strong>[0:00]</strong> <em>Sarah:</em> Welcome to the Web Accessibility Podcast. I'm your host, Sarah Johnson.</p>
    <p><strong>[0:05]</strong> <em>Sarah:</em> Today we're joined by Dr. Michael Chen, who has been researching accessibility for over 15 years.</p>
    <p><strong>[0:12]</strong> <em>Michael:</em> Thanks for having me, Sarah. I'm excited to discuss this important topic.</p>
    <p><strong>[0:18]</strong> <em>[Background music fades in softly]</em></p>
    <p><strong>[0:20]</strong> <em>Sarah:</em> Let's start with the basics. What exactly is web accessibility?</p>
    <!-- Continue with complete transcript including speaker identification and sound descriptions -->
  </div>
</section>

<!-- Chapter navigation for long audio -->
<nav aria-labelledby="chapter-nav-heading">
  <h4 id="chapter-nav-heading">Episode Chapters</h4>
  <ul>
    <li><a href="#chapter-1">Introduction (0:00)</a></li>
    <li><a href="#chapter-2">What is Web Accessibility? (2:30)</a></li>
    <li><a href="#chapter-3">Common Barriers (8:15)</a></li>
    <li><a href="#chapter-4">Practical Tips (15:45)</a></li>
    <li><a href="#chapter-5">Resources (22:10)</a></li>
  </ul>
</nav>`,
      badExample: `<!-- Audio without accessibility features -->
<audio controls autoplay>
  <source src="audio.mp3" type="audio/mpeg">
</audio>

<!-- Audio with no description or transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg">
  <!-- No transcript, description, or chapter navigation -->
</audio>

<!-- Background audio that can't be controlled -->
<audio autoplay loop>
  <source src="background-music.mp3" type="audio/mpeg">
  <!-- Auto-plays and loops without user control -->
</audio>`,
      explanation: 'Good example provides complete transcripts, descriptions, and chapter navigation. Bad examples lack transcripts and may auto-play inappropriately.'
    },

    {
      language: 'html',
      title: 'Accessible Media Player Controls',
      goodExample: `<!-- Custom accessible media player -->
<div class="media-player" role="region" aria-label="Video player">
  <video id="main-video" 
         width="640" 
         height="360"
         poster="video-poster.jpg">
    <source src="video.mp4" type="video/mp4">
    <track kind="captions" src="captions.vtt" srclang="en" default>
  </video>
  
  <!-- Accessible custom controls -->
  <div class="controls" role="toolbar" aria-label="Video controls">
    <button type="button" 
            id="play-pause" 
            aria-label="Play video"
            aria-describedby="play-pause-status">
      <span class="icon play-icon" aria-hidden="true">▶</span>
    </button>
    <div id="play-pause-status" class="sr-only">Video is paused</div>
    
    <button type="button" 
            id="mute-toggle" 
            aria-label="Mute audio"
            aria-describedby="volume-status">
      <span class="icon volume-icon" aria-hidden="true">🔊</span>
    </button>
    <div id="volume-status" class="sr-only">Volume at 75%</div>
    
    <!-- Volume slider -->
    <label for="volume-slider" class="sr-only">Volume</label>
    <input type="range" 
           id="volume-slider"
           min="0" 
           max="100" 
           value="75"
           aria-valuetext="75 percent"
           class="volume-control">
    
    <!-- Progress bar -->
    <div class="progress-container">
      <label for="progress-bar" class="sr-only">Video progress</label>
      <input type="range" 
             id="progress-bar"
             min="0" 
             max="100" 
             value="0"
             aria-valuetext="0 minutes 0 seconds of 5 minutes 30 seconds"
             class="progress-bar">
    </div>
    
    <!-- Time display -->
    <div class="time-display" aria-live="polite">
      <span id="current-time">0:00</span> / <span id="duration">5:30</span>
    </div>
    
    <!-- Captions toggle -->
    <button type="button" 
            id="captions-toggle" 
            aria-label="Turn on captions"
            aria-pressed="false">
      <span class="icon cc-icon" aria-hidden="true">CC</span>
    </button>
    
    <!-- Fullscreen toggle -->
    <button type="button" 
            id="fullscreen-toggle" 
            aria-label="Enter fullscreen">
      <span class="icon fullscreen-icon" aria-hidden="true">⛶</span>
    </button>
  </div>
  
  <!-- Keyboard shortcuts help -->
  <details class="keyboard-shortcuts">
    <summary>Keyboard Shortcuts</summary>
    <dl>
      <dt>Space or K</dt>
      <dd>Play/Pause</dd>
      <dt>M</dt>
      <dd>Mute/Unmute</dd>
      <dt>F</dt>
      <dd>Fullscreen</dd>
      <dt>C</dt>
      <dd>Toggle Captions</dd>
      <dt>Left/Right Arrow</dt>
      <dd>Seek backward/forward 5 seconds</dd>
      <dt>Up/Down Arrow</dt>
      <dd>Volume up/down</dd>
    </dl>
  </details>
</div>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.controls button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.controls input:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
</style>`,
      badExample: `<!-- Inaccessible custom media player -->
<div class="player">
  <video id="video" width="640" height="360">
    <source src="video.mp4" type="video/mp4">
  </video>
  
  <!-- Controls without accessibility -->
  <div class="controls">
    <div class="play-btn" onclick="togglePlay()">▶</div>
    <div class="volume-btn" onclick="toggleMute()">🔊</div>
    <div class="progress" onclick="seek(event)">
      <div class="progress-bar"></div>
    </div>
    <div class="fullscreen-btn" onclick="toggleFullscreen()">⛶</div>
  </div>
</div>

<!-- No keyboard support, no ARIA labels, no screen reader announcements -->`,
      explanation: 'Good example provides full keyboard accessibility, ARIA labels, live regions for announcements, and keyboard shortcuts. Bad example lacks accessibility features entirely.'
    }
  ],
  relatedGuidelines: [
    'accessibility-wcag-standards',
    'accessibility-visual',
    'html-best-practices'
  ]
};