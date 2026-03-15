import { GuidelineEntry } from '../../types';

export const htmlBestPractices: GuidelineEntry = {
  id: 'html-best-practices',
  title: 'HTML Best Practices',
  category: 'code-quality',
  priority: 'critical',
  description: 'Semantic HTML structure rules and accessibility standards for building well-structured, accessible web pages.',
  rules: [
    {
      statement: 'Use semantic HTML elements to convey meaning and structure',
      rationale: 'Semantic elements improve accessibility, SEO, and code maintainability by clearly defining content purpose',
      implementation: 'Choose appropriate semantic elements like <header>, <nav>, <main>, <article>, <section>, <aside>, <footer> instead of generic <div> elements',
      validation: {
        method: 'HTML validation and accessibility audit'
      }
    },
    {
      statement: 'Provide meaningful alt attributes for all images',
      rationale: 'Alt text is essential for screen readers and provides fallback content when images fail to load',
      implementation: 'Include descriptive alt text that conveys the image\'s purpose and content. Use empty alt="" for decorative images',
      validation: {
        method: 'Accessibility testing tools and manual review'
      }
    },
    {
      statement: 'Use proper heading hierarchy (h1-h6) to structure content',
      rationale: 'Logical heading structure helps screen readers navigate content and improves SEO',
      implementation: 'Start with h1 for main page title, use h2 for major sections, h3 for subsections, etc. Do not skip heading levels',
      validation: {
        method: 'Accessibility audit and heading structure analysis'
      }
    },
    {
      statement: 'Include proper form labels and fieldsets',
      rationale: 'Labels are required for screen reader accessibility and improve usability for all users',
      implementation: 'Associate every form input with a <label> using for/id attributes or by wrapping. Group related inputs with <fieldset> and <legend>',
      validation: {
        method: 'Form accessibility testing'
      }
    },
    {
      statement: 'Use valid HTML markup that passes W3C validation',
      rationale: 'Valid HTML ensures consistent rendering across browsers and better accessibility support',
      implementation: 'Follow HTML5 specification, properly nest elements, close all tags, and use correct attribute syntax',
      validation: {
        method: 'W3C Markup Validation Service'
      }
    }
  ],
  examples: [
    {
      language: 'html',
      title: 'Semantic HTML Structure',
      goodExample: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article Page</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <header>
        <h1>Main Article Title</h1>
        <p>Published on <time datetime="2024-01-15">January 15, 2024</time></p>
      </header>
      
      <section>
        <h2>Introduction</h2>
        <p>Article introduction content...</p>
      </section>
      
      <section>
        <h2>Main Content</h2>
        <p>Main article content...</p>
      </section>
    </article>
    
    <aside>
      <h2>Related Articles</h2>
      <ul>
        <li><a href="/related-1">Related Article 1</a></li>
      </ul>
    </aside>
  </main>
  
  <footer>
    <p>&copy; 2024 Website Name</p>
  </footer>
</body>
</html>`,
      badExample: `<!DOCTYPE html>
<html>
<head>
  <title>Article Page</title>
</head>
<body>
  <div class="header">
    <div class="nav">
      <div><a href="/">Home</a></div>
      <div><a href="/about">About</a></div>
    </div>
  </div>
  
  <div class="content">
    <div class="article">
      <div class="title">Main Article Title</div>
      <div class="date">January 15, 2024</div>
      
      <div class="section">
        <div class="heading">Introduction</div>
        <div>Article introduction content...</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <div>2024 Website Name</div>
  </div>
</body>
</html>`,
      explanation: 'The good example uses semantic HTML5 elements that convey meaning, while the bad example uses generic div elements that provide no semantic information.'
    },
    {
      language: 'html',
      title: 'Accessible Form Structure',
      goodExample: `<form>
  <fieldset>
    <legend>Personal Information</legend>
    
    <label for="firstName">First Name *</label>
    <input type="text" id="firstName" name="firstName" required aria-describedby="firstName-help">
    <div id="firstName-help">Enter your legal first name</div>
    
    <label for="email">Email Address *</label>
    <input type="email" id="email" name="email" required aria-describedby="email-help">
    <div id="email-help">We'll use this to contact you</div>
  </fieldset>
  
  <fieldset>
    <legend>Preferences</legend>
    
    <label>
      <input type="checkbox" name="newsletter" value="yes">
      Subscribe to newsletter
    </label>
    
    <fieldset>
      <legend>Contact Method</legend>
      <label>
        <input type="radio" name="contact" value="email" checked>
        Email
      </label>
      <label>
        <input type="radio" name="contact" value="phone">
        Phone
      </label>
    </fieldset>
  </fieldset>
  
  <button type="submit">Submit Form</button>
</form>`,
      badExample: `<form>
  <div>Personal Information</div>
  
  <div>First Name *</div>
  <input type="text" name="firstName" required>
  
  <div>Email Address *</div>
  <input type="email" name="email" required>
  
  <div>Preferences</div>
  
  <input type="checkbox" name="newsletter" value="yes">
  Subscribe to newsletter
  
  <div>Contact Method</div>
  <input type="radio" name="contact" value="email" checked> Email
  <input type="radio" name="contact" value="phone"> Phone
  
  <input type="submit" value="Submit Form">
</form>`,
      explanation: 'The good example uses proper labels, fieldsets, and ARIA attributes for accessibility, while the bad example lacks proper form structure and accessibility features.'
    }
  ],
  relatedGuidelines: ['accessibility-compliance', 'css-organization']
};