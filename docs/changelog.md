# Changelog

All notable changes to Pict-View are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.64] - Current

### Added
- TypeScript type definitions for improved IDE support
- JSDoc annotations throughout the codebase
- Transaction tracking for complex render hierarchies
- Virtual assignment render method for deferred content projection

### Changed
- View UUIDs now prefixed with `V-` to ensure valid HTML element IDs
- Improved error messages with view identifiers for easier debugging

### Fixed
- Callback handling in async render methods

## [1.0.x] - Previous Releases

### Core Features

#### View Lifecycle
- Complete initialization lifecycle with `onBeforeInitialize`, `onInitialize`, `onAfterInitialize`
- Async variants for all lifecycle methods
- Solve lifecycle for data computations
- Marshal lifecycle for bidirectional data flow

#### Rendering System
- Multiple render methods: `replace`, `append`, `prepend`, `append_once`
- Configurable renderables with template associations
- Data address resolution for template records
- Destination address support for DOM projection

#### Template System
- Template loading from configuration
- Default templates with prefix/postfix matching
- Template source tracking for debugging
- Integration with Pict's template parser

#### CSS Management
- View-scoped CSS injection
- Priority-based CSS ordering
- CSS hash and provider tracking
- Integration with Pict CSSMap service

### Configuration Options

#### Auto Behaviors
- `AutoInitialize` - Automatic initialization on app start
- `AutoRender` - Automatic rendering on app load
- `AutoSolveWithApp` - Automatic solving with app solve cycles
- Ordinal values for controlling execution order

#### Defaults
- `DefaultRenderable` - Fallback renderable for render calls
- `DefaultDestinationAddress` - Fallback DOM selector
- `DefaultTemplateRecordAddress` - Fallback data address

### API Methods

#### Rendering
- `render()` - Synchronous render with lifecycle hooks
- `renderAsync()` - Asynchronous render with callbacks
- `basicRender()` - Simple render without lifecycle overhead
- `renderWithScope()` - Render with custom template scope

#### Data Marshaling
- `marshalFromView()` - Pull data from view to app state
- `marshalToView()` - Push data from app state to view
- Async variants with callback support

#### Utilities
- `addRenderable()` - Runtime renderable registration
- `buildRenderOptions()` - Render option resolution
- `assignRenderContent()` - Content projection helper

## Migration Notes

### Upgrading to 1.0.x

If upgrading from earlier versions:

1. **View UUIDs** - UUIDs are now prefixed with `V-`. Update any code that relies on raw UUID values for element IDs.

2. **Async Callbacks** - Ensure all async lifecycle methods properly call their callbacks.

3. **Configuration** - Review default configuration values as some defaults may have changed.

## Roadmap

### Planned Features

- Enhanced error boundaries for render failures
- Built-in view composition patterns
- Performance monitoring hooks
- Server-side rendering support

### Under Consideration

- View state persistence
- Hot module replacement support
- Developer tools integration
- Animation lifecycle hooks

## Contributing

See the [Contributing Guide](https://github.com/stevenvelozo/pict-view/blob/master/CONTRIBUTING.md) for details on:

- Setting up a development environment
- Running tests
- Submitting pull requests
- Code style guidelines

## Support

- **Bugs**: [GitHub Issues](https://github.com/stevenvelozo/pict-view/issues)
- **Questions**: [GitHub Discussions](https://github.com/stevenvelozo/pict-view/discussions)
- **Security**: Contact maintainers directly for security issues
