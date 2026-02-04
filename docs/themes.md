# Themes

Pict-View provides built-in CSS management capabilities that allow you to style your views consistently and manage CSS injection priorities.

## View CSS Configuration

Each view can include its own CSS that will be automatically injected into the page:

```javascript
const viewConfiguration = {
    ViewIdentifier: "StyledView",

    CSS: `
        .my-component {
            background: #f5f5f5;
            padding: 16px;
            border-radius: 8px;
        }

        .my-component__title {
            font-size: 24px;
            color: #333;
            margin-bottom: 12px;
        }

        .my-component__content {
            color: #666;
            line-height: 1.6;
        }
    `,

    CSSHash: "styled-view-css",
    CSSProvider: "StyledView",
    CSSPriority: 500
};
```

## CSS Options

### CSSHash

A unique identifier for the CSS block. If not provided, defaults to `View-{ViewIdentifier}`.

```javascript
CSSHash: "my-custom-css-identifier"
```

### CSSProvider

A string identifying the source of the CSS. Useful for debugging and tracking where styles originate.

```javascript
CSSProvider: "UserProfileModule"
```

### CSSPriority

A numeric priority determining the order in which CSS is injected. Higher values are injected later, allowing them to override earlier styles.

```javascript
CSSPriority: 600  // Will be injected after priority 500
```

## Priority Guidelines

| Range | Use Case |
|-------|----------|
| 0-100 | Reset and base styles |
| 100-300 | Framework defaults |
| 300-500 | Component styles |
| 500-700 | View-specific styles |
| 700-900 | Override styles |
| 900+ | Critical overrides |

## Theming Patterns

### CSS Variables

Use CSS custom properties for themeable values:

```javascript
CSS: `
    :root {
        --view-primary-color: #007bff;
        --view-secondary-color: #6c757d;
        --view-border-radius: 4px;
    }

    .themed-button {
        background: var(--view-primary-color);
        border-radius: var(--view-border-radius);
    }
`
```

### Dark Mode Support

Include dark mode styles using media queries:

```javascript
CSS: `
    .card {
        background: white;
        color: #333;
    }

    @media (prefers-color-scheme: dark) {
        .card {
            background: #1a1a1a;
            color: #e0e0e0;
        }
    }
`
```

### BEM Naming Convention

Follow BEM (Block, Element, Modifier) naming for maintainable CSS:

```javascript
CSS: `
    /* Block */
    .user-card { }

    /* Element */
    .user-card__avatar { }
    .user-card__name { }
    .user-card__bio { }

    /* Modifier */
    .user-card--featured { }
    .user-card--compact { }
`
```

## Dynamic Styling

### Template-Based Classes

Use template expressions for dynamic class names:

```javascript
Templates: [
    {
        Hash: "Dynamic-Card",
        Template: /*html*/`
            <div class="card {~Data:Record.status~}-status">
                <span class="card__label">{~Data:Record.label~}</span>
            </div>
        `
    }
]
```

### Inline Styles from Data

For truly dynamic styles based on data:

```javascript
Templates: [
    {
        Hash: "Colored-Item",
        Template: /*html*/`
            <div style="background-color: {~Data:Record.color~};">
                {~Data:Record.content~}
            </div>
        `
    }
]
```

## Best Practices

1. **Scope your styles** - Prefix class names with view identifiers to avoid conflicts
2. **Use CSS priorities wisely** - Don't set everything to maximum priority
3. **Keep CSS modular** - Each view should only contain styles for its own templates
4. **Document your theme tokens** - If using CSS variables, document their purpose
5. **Test across views** - Ensure your styles don't leak to or conflict with other views

## Integration with Pict CSS Map

Pict-View uses Pict's `CSSMap` service for CSS management:

```javascript
// CSS is automatically added during view construction
// The following happens internally:
this.pict.CSSMap.addCSS(
    tmpCSSHash,
    this.options.CSS,
    tmpCSSProvider,
    this.options.CSSPriority
);
```

This ensures all view CSS is managed centrally and injected in the correct order.
