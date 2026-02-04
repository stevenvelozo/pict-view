# Configuration

Pict-View provides extensive configuration options to control view behavior. Configuration is passed to the view constructor and merged with sensible defaults.

## Default Configuration

```javascript
const defaultPictViewSettings = {
    DefaultRenderable: false,
    DefaultDestinationAddress: false,
    DefaultTemplateRecordAddress: false,

    ViewIdentifier: false,

    AutoInitialize: true,
    AutoInitializeOrdinal: 0,

    AutoRender: true,
    AutoRenderOrdinal: 0,

    AutoSolveWithApp: true,
    AutoSolveOrdinal: 0,

    CSSHash: false,
    CSS: false,
    CSSProvider: false,
    CSSPriority: 500,

    Templates: [],
    DefaultTemplates: [],
    Renderables: [],
    Manifests: {}
};
```

## Configuration Options

### View Identity

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ViewIdentifier` | string/boolean | `false` | A unique identifier for the view, visible in log entries for debugging |

### Default Behaviors

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `DefaultRenderable` | string/boolean | `false` | The default renderable hash to use when none is specified |
| `DefaultDestinationAddress` | string/boolean | `false` | Default DOM selector for content projection |
| `DefaultTemplateRecordAddress` | string/boolean | `false` | Default data address for template records (e.g., `'AppData.Content'`) |

### Auto Behaviors

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `AutoInitialize` | boolean | `true` | Automatically initialize view when app initializes |
| `AutoInitializeOrdinal` | number | `0` | Order priority for auto-initialization (lower = earlier) |
| `AutoRender` | boolean | `true` | Automatically render view when app autorenders |
| `AutoRenderOrdinal` | number | `0` | Order priority for auto-rendering |
| `AutoSolveWithApp` | boolean | `true` | Automatically solve view when app solves |
| `AutoSolveOrdinal` | number | `0` | Order priority for auto-solving |

### CSS Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `CSS` | string/boolean | `false` | CSS content to inject for this view |
| `CSSHash` | string/boolean | `false` | Unique identifier for the CSS block |
| `CSSProvider` | string/boolean | `false` | Provider identifier for CSS source tracking |
| `CSSPriority` | number | `500` | Priority for CSS injection ordering (higher = later) |

### Templates

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Templates` | array | `[]` | Array of template definitions |
| `DefaultTemplates` | array | `[]` | Array of default template definitions with prefix/postfix matching |

#### Template Object Structure

```javascript
{
    Hash: "Template-Identifier",
    Template: "<div>{~Data:Record.value~}</div>",
    Source: "Optional source description"
}
```

#### Default Template Object Structure

```javascript
{
    Prefix: "",
    Postfix: "-List-Row",
    Template: "<tr>{~Data:Record.name~}</tr>",
    Source: "Optional source description"
}
```

### Renderables

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Renderables` | array | `[]` | Array of renderable definitions |

#### Renderable Object Structure

```javascript
{
    RenderableHash: "Content-List",
    TemplateHash: "Content-List-Template",
    TemplateRecordAddress: "AppData.ContentList",
    DestinationAddress: "#content-container",
    RenderMethod: "replace"
}
```

### Manifests

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Manifests` | object | `{}` | Object containing manifest definitions for data transformation |

## Render Methods

The `RenderMethod` property on renderables controls how content is projected:

| Method | Description |
|--------|-------------|
| `replace` | Replace content at destination outright, overwriting what was there |
| `append` | Append content after all other content at destination |
| `prepend` | Prepend content before all other content at destination |
| `append_once` | Only append once; checks for existing content by ID |
| `virtual-assignment` | Deferred assignment for complex render transactions |

## Example Configuration

```javascript
const viewConfiguration = {
    ViewIdentifier: "UserProfile",

    DefaultRenderable: "Profile-Main",
    DefaultDestinationAddress: "#user-profile",
    DefaultTemplateRecordAddress: "AppData.CurrentUser",

    AutoInitialize: true,
    AutoRender: true,

    CSS: `
        .user-profile { padding: 20px; }
        .user-avatar { border-radius: 50%; }
    `,
    CSSPriority: 600,

    Templates: [
        {
            Hash: "Profile-Template",
            Template: /*html*/`
                <div class="user-profile">
                    <img class="user-avatar" src="{~Data:Record.avatar~}" />
                    <h1>{~Data:Record.name~}</h1>
                    <p>{~Data:Record.bio~}</p>
                </div>
            `
        }
    ],

    Renderables: [
        {
            RenderableHash: "Profile-Main",
            TemplateHash: "Profile-Template",
            DestinationAddress: "#user-profile",
            RenderMethod: "replace"
        }
    ]
};
```

## Runtime Configuration

While most configuration is set at construction time, some behaviors can be modified at runtime:

```javascript
// Add a renderable at runtime
myView.addRenderable(
    "Dynamic-Content",
    "Dynamic-Template",
    "AppData.DynamicData",
    "#dynamic-container",
    "append"
);

// Or pass a renderable object
myView.addRenderable({
    RenderableHash: "Dynamic-Content",
    TemplateHash: "Dynamic-Template",
    TemplateRecordAddress: "AppData.DynamicData",
    ContentDestinationAddress: "#dynamic-container",
    RenderMethod: "append"
});
```
