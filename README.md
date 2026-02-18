# Pict-View

[![npm version](https://badge.fury.io/js/pict-view.svg)](https://www.npmjs.com/package/pict-view)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible View base class for the Pict application framework.

Pict-View provides a non-opinionated foundation for building views in web, console, and other applications where the UI is represented as text strings. It integrates seamlessly with the Pict ecosystem including Fable, Orator, and Meadow.

## Features

- **Lifecycle Management** - Complete initialization, rendering, and solving lifecycles with sync and async support
- **Renderables** - Configurable content projection with multiple render methods (replace, append, prepend, append_once)
- **Template Integration** - Deep integration with Pict's template system for dynamic content
- **Data Marshaling** - Two-way data binding between views and application state
- **CSS Management** - Built-in CSS handling with priority-based injection
- **Transaction Tracking** - Automatic tracking for complex view hierarchies

## Installation

```bash
npm install pict-view
```

## Quick Start

```javascript
const libPictView = require('pict-view');

const viewConfiguration = {
    ViewIdentifier: "MyView",
    DefaultRenderable: 'Main-Content',
    DefaultDestinationAddress: "#app-container",
    DefaultTemplateRecordAddress: 'AppData.Content',

    Templates: [
        {
            Hash: "Main-Template",
            Template: `<div class="content">{~Data:Record.title~}</div>`
        }
    ],

    Renderables: [
        {
            RenderableHash: "Main-Content",
            TemplateHash: "Main-Template",
            DestinationAddress: "#app-container",
            RenderMethod: "replace"
        }
    ]
};

class MyView extends libPictView
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);
    }
}

module.exports = MyView;
module.exports.default_configuration = viewConfiguration;
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `ViewIdentifier` | string | Unique identifier for debugging |
| `DefaultRenderable` | string | Default renderable hash |
| `DefaultDestinationAddress` | string | Default DOM selector for rendering |
| `DefaultTemplateRecordAddress` | string | Default data address for templates |
| `AutoInitialize` | boolean | Auto-initialize with app (default: true) |
| `AutoRender` | boolean | Auto-render on app load (default: true) |
| `Templates` | array | Template definitions |
| `Renderables` | array | Renderable configurations |
| `CSS` | string | View-scoped CSS to inject |

## Render Methods

| Method | Description |
|--------|-------------|
| `replace` | Replace content at destination |
| `append` | Add content after existing content |
| `prepend` | Add content before existing content |
| `append_once` | Append only if not already present |

## Lifecycle Hooks

Override these methods to customize view behavior:

```javascript
class MyView extends libPictView
{
    onBeforeInitialize() { /* Before init */ }
    onInitialize() { /* During init */ }
    onAfterInitialize() { /* After init */ }

    onBeforeRender(pRenderable) { /* Before render */ }
    onAfterRender(pRenderable) { /* After render */ }

    onBeforeSolve() { /* Before solve */ }
    onSolve() { /* During solve */ }
    onAfterSolve() { /* After solve */ }

    onMarshalToView() { /* Push data to view */ }
    onMarshalFromView() { /* Pull data from view */ }
}
```

All lifecycle methods have async variants (e.g., `onInitializeAsync(fCallback)`).

## Documentation

Full documentation is available at [https://stevenvelozo.github.io/pict-view/](https://stevenvelozo.github.io/pict-view/)

- [Pict Views](https://stevenvelozo.github.io/pict-view/#/Pict-Views) - Core concepts
- [Renderables](https://stevenvelozo.github.io/pict-view/#/Pict%20View%20Renderables) - Working with renderables
- [Configuration](https://stevenvelozo.github.io/pict-view/#/configuration) - All configuration options
- [Contributing](https://stevenvelozo.github.io/pict-view/#/contributing) - How to contribute

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) - MVC application framework
- [pict-template](https://github.com/stevenvelozo/pict-template) - Template engine
- [pict-provider](https://github.com/stevenvelozo/pict-provider) - Data provider base class
- [fable](https://github.com/stevenvelozo/fable) - Application services framework

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
