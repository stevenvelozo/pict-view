# Pict-View Resources

A curated list of resources, tools, and projects related to Pict-View and the Pict ecosystem.

## Official Resources

### Core Libraries

- [Pict](https://github.com/stevenvelozo/pict) - The main Pict framework for building applications
- [Pict-View](https://github.com/stevenvelozo/pict-view) - View base class (this library)
- [Fable](https://github.com/stevenvelozo/fable) - Service provider framework that powers Pict
- [Fable-ServiceProviderBase](https://github.com/stevenvelozo/fable-serviceproviderbase) - Base class for Fable services

### Related Pict Packages

- [Pict-Application](https://github.com/stevenvelozo/pict-application) - Application wrapper for Pict
- [Pict-Provider](https://github.com/stevenvelozo/pict-provider) - Data providers for Pict
- [Pict-Template](https://github.com/stevenvelozo/pict-template) - Template engine for Pict
- [Pict-ContentAssignment](https://github.com/stevenvelozo/pict-content-assignment) - DOM content assignment utilities
- [Pict-DataProvider](https://github.com/stevenvelozo/pict-data-provider) - Data access layer

### Backend Ecosystem

- [Meadow](https://github.com/stevenvelozo/meadow) - Data access layer for Fable
- [Orator](https://github.com/stevenvelozo/orator) - Query building and execution
- [Foxhound](https://github.com/stevenvelozo/foxhound) - Query parser and generator

## Documentation

- [Pict-View Documentation](https://stevenvelozo.github.io/pict-view/) - This documentation site
- [Pict Documentation](https://stevenvelozo.github.io/pict/) - Main Pict framework docs

## Learning Resources

### Getting Started

1. Start with the [README](/) to understand the basics
2. Read about [Pict Views](Pict-Views.md) concepts
3. Learn about [Renderables](Pict%20View%20Renderables.md)
4. Explore the [Configuration](configuration.md) options

### Example Applications

- [Historical Events Example](Historical%20Events%20Example%20App.md) - A complete walkthrough of building a data-driven view

## Community

### Getting Help

- [GitHub Issues](https://github.com/stevenvelozo/pict-view/issues) - Report bugs or request features
- [GitHub Discussions](https://github.com/stevenvelozo/pict-view/discussions) - Ask questions and share ideas

### Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs** - Open an issue with reproduction steps
2. **Suggest Features** - Describe your use case and proposed solution
3. **Submit PRs** - Fork, branch, and submit a pull request
4. **Improve Docs** - Documentation improvements are always welcome
5. **Share Examples** - Create and share example applications

## Tools & Utilities

### Development

- [Quackage](https://github.com/stevenvelozo/quackage) - Build tool used by Pict projects
- [Browserify](http://browserify.org/) - Bundle Pict-View for browser use

### Testing

- [Mocha](https://mochajs.org/) - Test framework used by Pict-View
- [NYC](https://github.com/istanbuljs/nyc) - Code coverage tool

## Tips & Tricks

### Performance

- Use `append_once` render method for views that should only render once
- Set appropriate `AutoRenderOrdinal` values to control render order
- Use async lifecycle methods for I/O-bound operations

### Debugging

- Set `pict.LogNoisiness` to higher values (1-4) for detailed logging
- Enable `pict.LogControlFlow` for lifecycle tracing
- Use unique `ViewIdentifier` values for clear log messages

### Best Practices

- Keep views focused on single responsibilities
- Use configuration objects for reusable view definitions
- Leverage the lifecycle hooks for side effects
- Organize templates by feature, not by type

## License

Pict-View is released under the [MIT License](https://github.com/stevenvelozo/pict-view/blob/master/LICENSE).
