# Custom Navbar

This documentation site uses [Docsify](https://docsify.js.org/) for rendering. You can customize the navigation experience in several ways.

## Sidebar Navigation

The sidebar is defined in `_sidebar.md` and provides the main navigation structure:

```markdown
- Getting started

  - [Pict Views](Pict-Views.md)
  - [Renderables](Pict%20View%20Renderables.md)
  - [Configuration](configuration.md)

- Examples

  - [Historical Events App](Historical%20Events%20Example%20App.md)

- Reference

  - [Changelog](changelog.md)
```

## Adding a Top Navbar

To add a top navigation bar, create a `_navbar.md` file:

```markdown
- [Home](/)
- [GitHub](https://github.com/stevenvelozo/pict-view)
- [NPM](https://www.npmjs.com/package/pict-view)

- Related
  - [Pict](https://github.com/stevenvelozo/pict)
  - [Fable](https://github.com/stevenvelozo/fable)
```

Then enable it in `index.html`:

```javascript
window.$docsify = {
    loadNavbar: true
};
```

## Nested Navigation

Create nested navigation structures for complex documentation:

```markdown
- Getting Started
  - [Quick Start](quickstart.md)
  - [Installation](installation.md)

- Core Concepts
  - [Views](Pict-Views.md)
  - [Renderables](Pict%20View%20Renderables.md)
  - [Templates](templates.md)
  - [Lifecycle](lifecycle.md)

- API Reference
  - [Configuration](configuration.md)
  - [Methods](methods.md)
  - [Events](events.md)

- Examples
  - [Basic](examples/basic.md)
  - [Advanced](examples/advanced.md)
```

## Page-Specific Sidebars

You can have different sidebars for different sections by placing `_sidebar.md` files in subdirectories:

```
docs/
├── _sidebar.md          # Root sidebar
├── guide/
│   ├── _sidebar.md      # Guide-specific sidebar
│   └── intro.md
└── api/
    ├── _sidebar.md      # API-specific sidebar
    └── reference.md
```

Enable this with:

```javascript
window.$docsify = {
    loadSidebar: true,
    alias: {
        '/guide/.*/_sidebar.md': '/guide/_sidebar.md',
        '/api/.*/_sidebar.md': '/api/_sidebar.md'
    }
};
```

## Collapsible Sidebar Sections

For large documentation, use collapsible sections with the sidebar-collapse plugin:

```html
<script src="//cdn.jsdelivr.net/npm/docsify-sidebar-collapse/dist/docsify-sidebar-collapse.min.js"></script>
```

## Search Integration

Add search functionality to help users find content:

```html
<script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
```

```javascript
window.$docsify = {
    search: {
        placeholder: 'Search documentation',
        noData: 'No results found',
        depth: 3
    }
};
```

## Custom Styling

Style the navigation to match your project's theme:

```css
/* Custom sidebar styling */
.sidebar {
    background: #f8f9fa;
}

.sidebar-nav a {
    color: #333;
}

.sidebar-nav a:hover {
    color: #007bff;
}

/* Custom navbar styling */
.app-nav {
    background: #343a40;
}

.app-nav a {
    color: white;
}
```

## Mobile Navigation

Docsify automatically provides a hamburger menu for mobile devices. Ensure your styles are responsive:

```css
@media (max-width: 768px) {
    .sidebar {
        width: 100%;
    }

    .sidebar-toggle {
        background: #007bff;
    }
}
```
