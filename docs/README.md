# Pict-View

> A flexible View base class for the Pict application framework

Pict-View provides a non-opinionated foundation for building views in web, console, and other applications where the UI is represented as text strings. It is designed to work seamlessly with the Pict ecosystem including Fable, Orator, and Meadow.

## Features

- **Lifecycle Management** - Complete initialization, rendering, and solving lifecycles with both sync and async support
- **Renderables** - Configurable content projection system with multiple render methods (replace, append, prepend, append_once)
- **Template Integration** - Deep integration with Pict's template system for dynamic content generation
- **Data Marshaling** - Two-way data binding support between views and application state
- **CSS Management** - Built-in CSS handling with priority-based injection
- **Transaction Tracking** - Automatic tracking of render transactions for complex view hierarchies

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
            Template: `<div>{~Data:Record.title~}</div>`
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

## Installation

```bash
npm install pict-view
```

## Core Concepts

### Views
Views are the primary unit of UI composition in Pict. Each view manages one or more renderables and their associated templates.

### Renderables
Renderables define what content gets rendered and where. They connect templates to data and specify how content should be projected into the DOM.

### Templates
Templates use Pict's template syntax to generate dynamic content from data. They support data interpolation, iteration, conditionals, and custom template functions.

### Lifecycle
Views follow a predictable lifecycle: Initialize -> Solve -> Render -> Marshal. Each stage has before, during, and after hooks for customization.

## Documentation

- [Pict Views](Pict-Views.md) - Understanding the View concept
- [Renderables](Pict%20View%20Renderables.md) - Working with renderables
- [Configuration](configuration.md) - Configuration options reference
- [Historical Events Example](Historical%20Events%20Example%20App.md) - A complete example application

## Links

- [GitHub Repository](https://github.com/stevenvelozo/pict-view)
- [NPM Package](https://www.npmjs.com/package/pict-view)
- [Pict Framework](https://github.com/stevenvelozo/pict)
- [Fable](https://github.com/stevenvelozo/fable)
