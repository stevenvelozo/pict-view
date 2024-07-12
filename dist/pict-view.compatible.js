"use strict";

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
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
      * Fable Service Base
      * @author <steven@velozo.com>
      */
      var FableServiceProviderBase = /*#__PURE__*/function () {
        // The constructor can be used in two ways:
        // 1) With a fable, options object and service hash (the options object and service hash are optional)
        // 2) With an object or nothing as the first parameter, where it will be treated as the options object
        function FableServiceProviderBase(pFable, pOptions, pServiceHash) {
          _classCallCheck(this, FableServiceProviderBase);
          // Check if a fable was passed in; connect it if so
          if (_typeof(pFable) === 'object' && pFable.isFable) {
            this.connectFable(pFable);
          } else {
            this.fable = false;
          }

          // initialize options and UUID based on whether the fable was passed in or not.
          if (this.fable) {
            this.UUID = pFable.getUUID();
            this.options = _typeof(pOptions) === 'object' ? pOptions : {};
          } else {
            // With no fable, check to see if there was an object passed into either of the first two
            // Parameters, and if so, treat it as the options object
            this.options = _typeof(pFable) === 'object' && !pFable.isFable ? pFable : _typeof(pOptions) === 'object' ? pOptions : {};
            this.UUID = "CORE-SVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          }

          // It's expected that the deriving class will set this
          this.serviceType = "Unknown-".concat(this.UUID);

          // The service hash is used to identify the specific instantiation of the service in the services map
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : !this.fable && typeof pOptions === 'string' ? pOptions : "".concat(this.UUID);
        }
        return _createClass(FableServiceProviderBase, [{
          key: "connectFable",
          value: function connectFable(pFable) {
            if (_typeof(pFable) !== 'object' || !pFable.isFable) {
              var tmpErrorMessage = "Fable Service Provider Base: Cannot connect to Fable, invalid Fable object passed in.  The pFable parameter was a [".concat(_typeof(pFable), "].}");
              console.log(tmpErrorMessage);
              return new Error(tmpErrorMessage);
            }
            if (!this.fable) {
              this.fable = pFable;
            }
            if (!this.log) {
              this.log = this.fable.Logging;
            }
            if (!this.services) {
              this.services = this.fable.services;
            }
            if (!this.servicesMap) {
              this.servicesMap = this.fable.servicesMap;
            }
            return true;
          }
        }]);
      }();
      _defineProperty(FableServiceProviderBase, "isFableService", true);
      module.exports = FableServiceProviderBase;

      // This is left here in case we want to go back to having different code/base class for "core" services
      module.exports.CoreServiceProviderBase = FableServiceProviderBase;
    }, {}],
    2: [function (require, module, exports) {
      var libFableServiceBase = require('fable-serviceproviderbase');
      var defaultPictViewSettings = {
        DefaultRenderable: false,
        DefaultDestinationAddress: false,
        DefaultTemplateRecordAddress: false,
        ViewIdentifier: false,
        // If this is set to true, when the App initializes this will.
        // After the App initializes, initialize will be called as soon as it's added.
        AutoInitialize: true,
        AutoInitializeOrdinal: 0,
        // If this is set to true, when the App autorenders (on load) this will.
        // After the App initializes, render will be called as soon as it's added.
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
      var PictView = /*#__PURE__*/function (_libFableServiceBase) {
        function PictView(pFable, pOptions, pServiceHash) {
          var _this;
          _classCallCheck(this, PictView);
          // Intersect default options, parent constructor, service information
          var tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
          _this = _callSuper(this, PictView, [pFable, tmpOptions, pServiceHash]);
          if (!_this.options.ViewIdentifier) {
            _this.options.ViewIdentifier = "AutoViewID-".concat(_this.fable.getUUID());
          }
          _this.serviceType = 'PictView';
          // Convenience and consistency naming
          _this.pict = _this.fable;
          // Wire in the essential Pict application state
          _this.AppData = _this.pict.AppData;
          _this.initializeTimestamp = false;
          _this.lastSolvedTimestamp = false;
          _this.lastRenderedTimestamp = false;
          _this.lastMarshalFromViewTimestamp = false;
          _this.lastMarshalToViewTimestamp = false;

          // Load all templates from the array in the options
          // Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
          for (var i = 0; i < _this.options.Templates.length; i++) {
            var tmpTemplate = _this.options.Templates[i];
            if (!('Hash' in tmpTemplate) || !('Template' in tmpTemplate)) {
              _this.log.error("PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " could not load Template ").concat(i, " in the options array."), tmpTemplate);
            } else {
              if (!tmpTemplate.Source) {
                tmpTemplate.Source = "PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " options object.");
              }
              _this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
            }
          }

          // Load all default templates from the array in the options
          // Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
          for (var _i = 0; _i < _this.options.DefaultTemplates.length; _i++) {
            var tmpDefaultTemplate = _this.options.DefaultTemplates[_i];
            if (!('Postfix' in tmpDefaultTemplate) || !('Template' in tmpDefaultTemplate)) {
              _this.log.error("PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " could not load Default Template ").concat(_i, " in the options array."), tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = "PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " options object.");
              }
              _this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }

          // Load the CSS if it's available
          if (_this.options.CSS) {
            var tmpCSSHash = _this.options.CSSHash ? _this.options.CSSHash : "View-".concat(_this.options.ViewIdentifier);
            var tmpCSSProvider = _this.options.CSSProvider ? _this.options.CSSProvider : tmpCSSHash;
            _this.pict.CSSMap.addCSS(tmpCSSHash, _this.options.CSS, tmpCSSProvider, _this.options.CSSPriority);
          }

          // Load all renderables
          // Renderables are launchable renderable instructions with templates
          // They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
          // The only parts that are necessary are Identifier and Template
          // A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
          _this.renderables = {};
          for (var _i2 = 0; _i2 < _this.options.Renderables.length; _i2++) {
            var tmpRenderable = _this.options.Renderables[_i2];
            _this.addRenderable(_this.options.Renderables[_i2]);
          }
          return _this;
        }
        _inherits(PictView, _libFableServiceBase);
        return _createClass(PictView, [{
          key: "addRenderable",
          value: function addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateDataAddress, pDefaultDestinationAddress, pRenderMethod) {
            var tmpRenderable = false;
            if (_typeof(pRenderableHash) == 'object') {
              // The developer passed in the renderable as an object.
              // Use theirs instead!
              tmpRenderable = pRenderableHash;
            } else {
              var tmpRenderMethod = typeof pRenderMethod !== 'string' ? pRenderMethod : 'replace';
              tmpRenderable = {
                RenderableHash: pRenderableHash,
                TemplateHash: pTemplateHash,
                DefaultTemplateDataAddress: pDefaultTemplateDataAddress,
                DefaultDestinationAddress: pDefaultDestinationAddress,
                RenderMethod: tmpRenderMethod
              };
            }
            if (typeof tmpRenderable.RenderableHash != 'string' || typeof tmpRenderable.TemplateHash != 'string') {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Renderable; RenderableHash or TemplateHash are invalid."), tmpRenderable);
            } else {
              if (this.pict.LogNoisiness > 0) {
                this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " adding renderable [").concat(tmpRenderable.RenderableHash, "] pointed to template ").concat(tmpRenderable.TemplateHash, "."));
              }
              this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
            }
          }

          /* -------------------------------------------------------------------------- */
          /*                        Code Section: Initialization                        */
          /* -------------------------------------------------------------------------- */
        }, {
          key: "onBeforeInitialize",
          value: function onBeforeInitialize() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeInitialize:"));
            }
            return true;
          }
        }, {
          key: "onBeforeInitializeAsync",
          value: function onBeforeInitializeAsync(fCallback) {
            this.onBeforeInitialize();
            return fCallback();
          }
        }, {
          key: "onInitialize",
          value: function onInitialize() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onInitialize:"));
            }
            return true;
          }
        }, {
          key: "onInitializeAsync",
          value: function onInitializeAsync(fCallback) {
            this.onInitialize();
            return fCallback();
          }
        }, {
          key: "initialize",
          value: function initialize() {
            if (this.pict.LogControlFlow) {
              this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize:"));
            }
            if (!this.initializeTimestamp) {
              this.onBeforeInitialize();
              this.onInitialize();
              this.onAfterInitialize();
              this.initializeTimestamp = this.pict.log.getTimeStamp();
              return true;
            } else {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize called but initialization is already completed.  Aborting."));
              return false;
            }
          }
        }, {
          key: "initializeAsync",
          value: function initializeAsync(fCallback) {
            var _this2 = this;
            if (this.pict.LogControlFlow) {
              this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initializeAsync:"));
            }
            if (!this.initializeTimestamp) {
              var tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
              if (this.pict.LogNoisiness > 0) {
                this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " beginning initialization..."));
              }
              tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
              tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
              tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
              tmpAnticipate.wait(function (pError) {
                _this2.initializeTimestamp = _this2.pict.log.getTimeStamp();
                if (_this2.pict.LogNoisiness > 0) {
                  _this2.log.info("PictView [".concat(_this2.UUID, "]::[").concat(_this2.Hash, "] ").concat(_this2.options.ViewIdentifier, " initialization complete."));
                }
                return fCallback();
              });
            } else {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " async initialize called but initialization is already completed.  Aborting."));
              // TODO: Should this be an error?
              return fCallback();
            }
          }
        }, {
          key: "onAfterInitialize",
          value: function onAfterInitialize() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterInitialize:"));
            }
            return true;
          }
        }, {
          key: "onAfterInitializeAsync",
          value: function onAfterInitializeAsync(fCallback) {
            this.onAfterInitialize();
            return fCallback();
          }

          /* -------------------------------------------------------------------------- */
          /*                            Code Section: Render                            */
          /* -------------------------------------------------------------------------- */
        }, {
          key: "onBeforeRender",
          value: function onBeforeRender(pRenderable, pRenderDestinationAddress, pData) {
            // Overload this to mess with stuff before the content gets generated from the template
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeRender:"));
            }
            return true;
          }
        }, {
          key: "onBeforeRenderAsync",
          value: function onBeforeRenderAsync(fCallback) {
            return fCallback();
          }
        }, {
          key: "render",
          value: function render(pRenderable, pRenderDestinationAddress, pTemplateDataAddress) {
            var tmpRenderableHash = typeof pRenderable === 'string' ? pRenderable : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
            if (!tmpRenderableHash) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it is not a valid renderable."));
              return false;
            }
            var tmpRenderable = this.renderables[tmpRenderableHash];
            if (!tmpRenderable) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist."));
              return false;
            }
            var tmpRenderDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
            if (!tmpRenderDestinationAddress) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not have a valid destination address."));
              return false;
            }
            var tmpDataAddress;
            var tmpData;
            if (_typeof(pTemplateDataAddress) === 'object') {
              tmpData = pTemplateDataAddress;
              tmpDataAddress = 'Passed in as object';
            } else {
              tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
              tmpData = typeof tmpDataAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
            }

            // Execute the developer-overridable pre-render behavior
            this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);
            if (this.pict.LogControlFlow) {
              this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] Renderable[").concat(tmpRenderableHash, "] Destination[").concat(tmpRenderDestinationAddress, "] TemplateDataAddress[").concat(tmpDataAddress, "] render:"));
            }
            if (this.pict.LogNoisiness > 0) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Beginning Render of Renderable[").concat(tmpRenderableHash, "] to Destination [").concat(tmpRenderDestinationAddress, "]..."));
            }
            // Generate the content output from the template and data
            var tmpContent = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData, null, [this]);
            if (this.pict.LogNoisiness > 0) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Assigning Renderable[").concat(tmpRenderableHash, "] content length ").concat(tmpContent.length, " to Destination [").concat(tmpRenderDestinationAddress, "] using render method [").concat(tmpRenderable.RenderMethod, "]."));
            }

            // Assign the content to the destination address
            switch (tmpRenderable.RenderMethod) {
              case 'append':
                this.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, tmpContent);
                break;
              case 'prepend':
                this.pict.ContentAssignment.prependContent(tmpRenderDestinationAddress, tmpContent);
                break;
              case 'append_once':
                // Try to find the content in the destination address
                var tmpExistingContent = this.pict.ContentAssignment.getElement("#".concat(tmpRenderableHash));
                if (tmpExistingContent.length < 1) {
                  this.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, tmpContent);
                }
                break;
              case 'replace':
              // TODO: Should this be the default?
              default:
                this.pict.ContentAssignment.assignContent(tmpRenderDestinationAddress, tmpContent);
                break;
            }

            // Execute the developer-overridable post-render behavior
            this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData, tmpContent);
            this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
            return true;
          }
        }, {
          key: "renderAsync",
          value: function renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateDataAddress, fCallback) {
            var _this3 = this;
            var tmpRenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;

            // Allow the callback to be passed in as the last parameter no matter what
            var tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateDataAddress === 'function' ? pTemplateDataAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : false;
            if (!tmpCallback) {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
              tmpCallback = function tmpCallback(pError) {
                if (pError) {
                  _this3.log.error("PictView [".concat(_this3.UUID, "]::[").concat(_this3.Hash, "] ").concat(_this3.options.Name, " renderAsync Auto Callback Error: ").concat(pError), pError);
                }
              };
            }
            if (!tmpRenderableHash) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, "because it is not a valid renderable."));
              return tmpCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, "because it is not a valid renderable.")));
            }
            var tmpRenderable = this.renderables[tmpRenderableHash];
            if (!tmpRenderable) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist."));
              return tmpCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist.")));
            }
            var tmpRenderDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
            if (!tmpRenderDestinationAddress) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not have a valid destination address."));
              return tmpCallback(Error("Could not render ".concat(tmpRenderableHash)));
            }
            var tmpDataAddress;
            var tmpData;
            if (_typeof(pTemplateDataAddress) === 'object') {
              tmpData = pTemplateDataAddress;
              tmpDataAddress = 'Passed in as object';
            } else {
              tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
              tmpData = typeof tmpDataAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
            }
            if (this.pict.LogControlFlow) {
              this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] Renderable[").concat(tmpRenderableHash, "] Destination[").concat(tmpRenderDestinationAddress, "] TemplateDataAddress[").concat(tmpDataAddress, "] renderAsync:"));
            }
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Beginning Asynchronous Render (callback-style)..."));
            }
            var tmpAnticipate = this.fable.newAnticipate();
            tmpAnticipate.anticipate(function (fOnBeforeRenderCallback) {
              _this3.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);
              _this3.onBeforeRenderAsync(fOnBeforeRenderCallback);
            });
            tmpAnticipate.anticipate(function (fAsyncTemplateCallback) {
              // Render the template (asynchronously)
              _this3.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData, function (pError, pContent) {
                if (pError) {
                  _this3.log.error("PictView [".concat(_this3.UUID, "]::[").concat(_this3.Hash, "] ").concat(_this3.options.ViewIdentifier, " could not render (asynchronously) ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it did not parse the template."), pError);
                  return fAsyncTemplateCallback(pError);
                }
                if (_this3.pict.LogNoisiness > 0) {
                  _this3.log.trace("PictView [".concat(_this3.UUID, "]::[").concat(_this3.Hash, "] ").concat(_this3.options.ViewIdentifier, " Assigning Renderable[").concat(tmpRenderableHash, "] content length ").concat(pContent.length, " to Destination [").concat(tmpRenderDestinationAddress, "] using Async render method ").concat(tmpRenderable.RenderMethod, "."));
                }

                // Assign the content to the destination address
                switch (tmpRenderable.RenderMethod) {
                  case 'append':
                    _this3.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, pContent);
                    break;
                  case 'prepend':
                    _this3.pict.ContentAssignment.prependContent(tmpRenderDestinationAddress, pContent);
                    break;
                  case 'append_once':
                    // Try to find the content in the destination address
                    var tmpExistingContent = _this3.pict.ContentAssignment.getElement("#".concat(tmpRenderableHash));
                    if (tmpExistingContent.length < 1) {
                      _this3.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, pContent);
                    }
                  case 'replace':
                  default:
                    _this3.pict.ContentAssignment.assignContent(tmpRenderDestinationAddress, pContent);
                    break;
                }

                // Execute the developer-overridable asynchronous post-render behavior
                _this3.lastRenderedTimestamp = _this3.pict.log.getTimeStamp();
                return fAsyncTemplateCallback();
              }, [_this3]);
            });
            tmpAnticipate.anticipate(function (fOnAfterRenderCallback) {
              _this3.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);
              _this3.onAfterRenderAsync(fOnAfterRenderCallback);
            });
            tmpAnticipate.wait(tmpCallback);
          }
        }, {
          key: "renderDefaultAsync",
          value: function renderDefaultAsync(fCallback) {
            // Render the default renderable
            this.renderAsync(fCallback);
          }
        }, {
          key: "onAfterRender",
          value: function onAfterRender(pRenderable, pRenderDestinationAddress, pData) {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterRender:"));
            }
            return true;
          }
        }, {
          key: "onAfterRenderAsync",
          value: function onAfterRenderAsync(fCallback) {
            return fCallback();
          }

          /* -------------------------------------------------------------------------- */
          /*                            Code Section: Solver                            */
          /* -------------------------------------------------------------------------- */
        }, {
          key: "onBeforeSolve",
          value: function onBeforeSolve() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeSolve:"));
            }
            return true;
          }
        }, {
          key: "onBeforeSolveAsync",
          value: function onBeforeSolveAsync(fCallback) {
            this.onBeforeSolve();
            return fCallback();
          }
        }, {
          key: "onSolve",
          value: function onSolve() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onSolve:"));
            }
            return true;
          }
        }, {
          key: "onSolveAsync",
          value: function onSolveAsync(fCallback) {
            this.onSolve();
            return fCallback();
          }
        }, {
          key: "solve",
          value: function solve() {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
            }
            this.onBeforeSolve();
            this.onSolve();
            this.onAfterSolve();
            this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
            return true;
          }
        }, {
          key: "solveAsync",
          value: function solveAsync(fCallback) {
            var _this4 = this;
            var tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            var tmpCallback = typeof fCallback === 'function' ? fCallback : false;
            if (!tmpCallback) {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
              tmpCallback = function tmpCallback(pError) {
                if (pError) {
                  _this4.log.error("PictView [".concat(_this4.UUID, "]::[").concat(_this4.Hash, "] ").concat(_this4.options.Name, " solveAsync Auto Callback Error: ").concat(pError), pError);
                }
              };
            }
            tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));
            tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));
            tmpAnticipate.wait(function (pError) {
              if (_this4.pict.LogNoisiness > 2) {
                _this4.log.trace("PictView [".concat(_this4.UUID, "]::[").concat(_this4.Hash, "] ").concat(_this4.options.ViewIdentifier, " solveAsync() complete."));
              }
              _this4.lastSolvedTimestamp = _this4.pict.log.getTimeStamp();
              return tmpCallback(pError);
            });
          }
        }, {
          key: "onAfterSolve",
          value: function onAfterSolve() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterSolve:"));
            }
            return true;
          }
        }, {
          key: "onAfterSolveAsync",
          value: function onAfterSolveAsync(fCallback) {
            this.onAfterSolve();
            return fCallback();
          }

          /* -------------------------------------------------------------------------- */
          /*                     Code Section: Marshal From View                        */
          /* -------------------------------------------------------------------------- */
        }, {
          key: "onBeforeMarshalFromView",
          value: function onBeforeMarshalFromView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeMarshalFromView:"));
            }
            return true;
          }
        }, {
          key: "onBeforeMarshalFromViewAsync",
          value: function onBeforeMarshalFromViewAsync(fCallback) {
            this.onBeforeMarshalFromView();
            return fCallback();
          }
        }, {
          key: "onMarshalFromView",
          value: function onMarshalFromView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onMarshalFromView:"));
            }
            return true;
          }
        }, {
          key: "onMarshalFromViewAsync",
          value: function onMarshalFromViewAsync(fCallback) {
            this.onMarshalFromView();
            return fCallback();
          }
        }, {
          key: "marshalFromView",
          value: function marshalFromView() {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
            }
            this.onBeforeMarshalFromView();
            this.onMarshalFromView();
            this.onAfterMarshalFromView();
            this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
            return true;
          }
        }, {
          key: "marshalFromViewAsync",
          value: function marshalFromViewAsync(fCallback) {
            var _this5 = this;
            var tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            var tmpCallback = typeof fCallback === 'function' ? fCallback : false;
            if (!tmpCallback) {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalFromViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
              tmpCallback = function tmpCallback(pError) {
                if (pError) {
                  _this5.log.error("PictView [".concat(_this5.UUID, "]::[").concat(_this5.Hash, "] ").concat(_this5.options.Name, " marshalFromViewAsync Auto Callback Error: ").concat(pError), pError);
                }
              };
            }
            tmpAnticipate.anticipate(this.onBeforeMarshalFromViewAsync.bind(this));
            tmpAnticipate.anticipate(this.onMarshalFromViewAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterMarshalFromViewAsync.bind(this));
            tmpAnticipate.wait(function (pError) {
              if (_this5.pict.LogNoisiness > 2) {
                _this5.log.trace("PictView [".concat(_this5.UUID, "]::[").concat(_this5.Hash, "] ").concat(_this5.options.ViewIdentifier, " marshalFromViewAsync() complete."));
              }
              _this5.lastMarshalFromViewTimestamp = _this5.pict.log.getTimeStamp();
              return tmpCallback(pError);
            });
          }
        }, {
          key: "onAfterMarshalFromView",
          value: function onAfterMarshalFromView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterMarshalFromView:"));
            }
            return true;
          }
        }, {
          key: "onAfterMarshalFromViewAsync",
          value: function onAfterMarshalFromViewAsync(fCallback) {
            this.onAfterMarshalFromView();
            return fCallback();
          }

          /* -------------------------------------------------------------------------- */
          /*                     Code Section: Marshal To View                          */
          /* -------------------------------------------------------------------------- */
        }, {
          key: "onBeforeMarshalToView",
          value: function onBeforeMarshalToView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeMarshalToView:"));
            }
            return true;
          }
        }, {
          key: "onBeforeMarshalToViewAsync",
          value: function onBeforeMarshalToViewAsync(fCallback) {
            this.onBeforeMarshalToView();
            return fCallback();
          }
        }, {
          key: "onMarshalToView",
          value: function onMarshalToView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onMarshalToView:"));
            }
            return true;
          }
        }, {
          key: "onMarshalToViewAsync",
          value: function onMarshalToViewAsync(fCallback) {
            this.onMarshalToView();
            return fCallback();
          }
        }, {
          key: "marshalToView",
          value: function marshalToView() {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
            }
            this.onBeforeMarshalToView();
            this.onMarshalToView();
            this.onAfterMarshalToView();
            this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
            return true;
          }
        }, {
          key: "marshalToViewAsync",
          value: function marshalToViewAsync(fCallback) {
            var _this6 = this;
            var tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            var tmpCallback = typeof fCallback === 'function' ? fCallback : false;
            if (!tmpCallback) {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalToViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
              tmpCallback = function tmpCallback(pError) {
                if (pError) {
                  _this6.log.error("PictView [".concat(_this6.UUID, "]::[").concat(_this6.Hash, "] ").concat(_this6.options.Name, " marshalToViewAsync Auto Callback Error: ").concat(pError), pError);
                }
              };
            }
            tmpAnticipate.anticipate(this.onBeforeMarshalToViewAsync.bind(this));
            tmpAnticipate.anticipate(this.onMarshalToViewAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterMarshalToViewAsync.bind(this));
            tmpAnticipate.wait(function (pError) {
              if (_this6.pict.LogNoisiness > 2) {
                _this6.log.trace("PictView [".concat(_this6.UUID, "]::[").concat(_this6.Hash, "] ").concat(_this6.options.ViewIdentifier, " marshalToViewAsync() complete."));
              }
              _this6.lastMarshalToViewTimestamp = _this6.pict.log.getTimeStamp();
              return tmpCallback(pError);
            });
          }
        }, {
          key: "onAfterMarshalToView",
          value: function onAfterMarshalToView() {
            if (this.pict.LogNoisiness > 3) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterMarshalToView:"));
            }
            return true;
          }
        }, {
          key: "onAfterMarshalToViewAsync",
          value: function onAfterMarshalToViewAsync(fCallback) {
            this.onAfterMarshalToView();
            return fCallback();
          }
        }]);
      }(libFableServiceBase);
      _defineProperty(PictView, "isPictView", true);
      module.exports = PictView;
    }, {
      "fable-serviceproviderbase": 1
    }]
  }, {}, [2])(2);
});