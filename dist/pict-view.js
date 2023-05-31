"use strict";

function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.PictView = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      /**
      * Fable Core Pre-initialization Service Base
      *
      * For a couple services, we need to be able to instantiate them before the Fable object is fully initialized.
      * This is a base class for those services.
      *
      * @author <steven@velozo.com>
      */

      class FableCoreServiceProviderBase {
        constructor(pOptions, pServiceHash) {
          this.fable = false;
          this.options = typeof pOptions === 'object' ? pOptions : {};
          this.serviceType = 'Unknown';

          // The hash will be a non-standard UUID ... the UUID service uses this base class!
          this.UUID = "CORESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);
        }
        // After fable is initialized, it would be expected to be wired in as a normal service.
        connectFable(pFable) {
          this.fable = pFable;
          return true;
        }
      }
      _defineProperty(FableCoreServiceProviderBase, "isFableService", true);
      module.exports = FableCoreServiceProviderBase;
    }, {}],
    2: [function (require, module, exports) {
      /**
      * Fable Service Base
      * @author <steven@velozo.com>
      */

      class FableServiceProviderBase {
        constructor(pFable, pOptions, pServiceHash) {
          this.fable = pFable;
          this.options = typeof pOptions === 'object' ? pOptions : typeof pFable === 'object' && !pFable.isFable ? pFable : {};
          this.serviceType = 'Unknown';
          if (typeof pFable.getUUID == 'function') {
            this.UUID = pFable.getUUID();
          } else {
            this.UUID = "NoFABLESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          }
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);

          // Pull back a few things
          this.log = this.fable.log;
          this.services = this.fable.services;
          this.defaultServices = this.fable.defaultServices;
        }
      }
      _defineProperty(FableServiceProviderBase, "isFableService", true);
      module.exports = FableServiceProviderBase;
      module.exports.CoreServiceProviderBase = require('./Fable-ServiceProviderBase-Preinit.js');
    }, {
      "./Fable-ServiceProviderBase-Preinit.js": 1
    }],
    3: [function (require, module, exports) {
      const libFableServiceBase = require('fable-serviceproviderbase');
      const defaultPictViewSettings = {
        DefaultRenderable: false,
        DefaultDestinationAddress: false,
        DefaultTemplateRecordAddress: false,
        ViewIdentifier: 'DEFAULT',
        InitializeOnLoad: true,
        RenderOnLoad: false,
        Templates: [],
        DefaultTemplates: [],
        Renderables: [],
        Manifests: {}
      };
      class PictView extends libFableServiceBase {
        constructor(pFable, pOptions, pServiceHash) {
          let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
          super(pFable, tmpOptions, pServiceHash);
          this.serviceType = 'PictView';

          // Wire in the essential Pict service
          this.AppData = this.fable.AppData;

          // Load all templates from the array in the options
          // Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
          for (let i = 0; i < this.options.Templates.length; i++) {
            let tmpTemplate = this.options.Templates[i];
            if (!tmpTemplate.hasOwnProperty('Hash') || !tmpTemplate.hasOwnProperty('Template')) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Template ").concat(i, " in the options array."), tmpTemplate);
            } else {
              if (!tmpTemplate.Source) {
                tmpTemplate.Source = "PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " options object.");
              }
              this.fable.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
            }
          }

          // Load all default templates from the array in the options
          // Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
          for (let i = 0; i < this.options.DefaultTemplates.length; i++) {
            let tmpDefaultTemplate = this.options.DefaultTemplates[i];
            if (!tmpDefaultTemplate.hasOwnProperty('Postfix') || !tmpDefaultTemplate.hasOwnProperty('Template')) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Default Template ").concat(i, " in the options array."), tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = "PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " options object.");
              }
              this.fable.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }

          // Load all renderables
          // Renderables are launchable renderable instructions with templates
          // They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
          // The only parts that are necessary are Identifier and Template
          // A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
          this.renderables = {};
          for (let i = 0; i < this.options.Renderables.length; i++) {
            let tmpRenderable = this.options.Renderables[i];
            if (!tmpRenderable.hasOwnProperty('RenderableHash') || !tmpRenderable.hasOwnProperty('TemplateHash')) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Renderable ").concat(i, " in the options array."), tmpRenderable);
            } else {
              this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
            }
          }
          if (this.options.InitializeOnLoad) {
            this.initialize();
          }
          if (this.options.RenderOnLoad) {
            this.render(this.options.DefaultRenderable, this.options.DefaultDestinationAddress, this.options.DefaultTemplateRecordAddress);
            this.postInitialRenderInitialize();
          }
        }
        internalInitialize() {
          return true;
        }
        postInitialRenderInitialize() {
          return true;
        }
        initialize() {
          this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " beginning initialization..."));
          this.internalInitialize();
          this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialization complete."));
        }
        render(pRenderable, pRenderDestinationAddress, pTemplateDataAddress) {
          let tmpRenderableHash = typeof pRenderable === 'string' ? pRenderable : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
          if (!tmpRenderableHash) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it is not a valid renderable."));
            return false;
          }
          let tmpRenderable = this.renderables[tmpRenderableHash];
          if (!tmpRenderable) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist."));
            return false;
          }
          let tmpRenderDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
          if (!tmpRenderDestinationAddress) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not have a valid destination address."));
            return false;
          }
          let tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.RecordAddress === 'string' ? tmpRenderable.RecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
          let tmpData = typeof tmpDataAddress === 'string' ? this.fable.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
          let tmpContent = this.fable.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData);
          return this.fable.ContentAssignment.assignContent(tmpRenderDestinationAddress, tmpContent);
        }
        renderAsync(pRenderable, pRenderDestinationAddress, pTemplateDataAddress, fCallback) {
          let tmpRenderableHash = typeof pRenderable === 'string' ? pRenderable : false;
          if (!tmpRenderableHash) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, "because it is not a valid renderable."));
            return fCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, "because it is not a valid renderable.")));
          }
          let tmpRenderable = this.renderables[tmpRenderableHash];
          if (!tmpRenderable) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist."));
            return fCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist.")));
          }
          let tmpRenderDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
          if (!tmpRenderDestinationAddress) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not have a valid destination address."));
            return fCallback(Error("Could not render ".concat(tmpRenderableHash)));
          }
          let tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.RecordAddress === 'string' ? tmpRenderable.RecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
          let tmpData = typeof tmpDataAddress === 'string' ? this.fable.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
          this.fable.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData, (pError, pContent) => {
            if (pError) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render (asynchronously) ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it did not parse the template."), pError);
              return fCallback(pError);
            }
            this.fable.ContentAssignment.assignContent(tmpRenderDestinationAddress, pContent);
            return fCallback(null, pContent);
          });
        }
      }
      module.exports = PictView;
    }, {
      "fable-serviceproviderbase": 2
    }]
  }, {}, [3])(3);
});