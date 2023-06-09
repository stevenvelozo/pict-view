"use strict";

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
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
      * Fable Core Pre-initialization Service Base
      *
      * For a couple services, we need to be able to instantiate them before the Fable object is fully initialized.
      * This is a base class for those services.
      *
      * @author <steven@velozo.com>
      */
      var FableCoreServiceProviderBase = /*#__PURE__*/function () {
        function FableCoreServiceProviderBase(pOptions, pServiceHash) {
          _classCallCheck(this, FableCoreServiceProviderBase);
          this.fable = false;
          this.options = _typeof(pOptions) === 'object' ? pOptions : {};
          this.serviceType = 'Unknown';

          // The hash will be a non-standard UUID ... the UUID service uses this base class!
          this.UUID = "CORESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);
        }
        _createClass(FableCoreServiceProviderBase, [{
          key: "connectFable",
          value:
          // After fable is initialized, it would be expected to be wired in as a normal service.
          function connectFable(pFable) {
            this.fable = pFable;
            return true;
          }
        }]);
        return FableCoreServiceProviderBase;
      }();
      _defineProperty(FableCoreServiceProviderBase, "isFableService", true);
      module.exports = FableCoreServiceProviderBase;
    }, {}],
    2: [function (require, module, exports) {
      /**
      * Fable Service Base
      * @author <steven@velozo.com>
      */
      var FableServiceProviderBase = /*#__PURE__*/_createClass(function FableServiceProviderBase(pFable, pOptions, pServiceHash) {
        _classCallCheck(this, FableServiceProviderBase);
        this.fable = pFable;
        this.options = _typeof(pOptions) === 'object' ? pOptions : _typeof(pFable) === 'object' && !pFable.isFable ? pFable : {};
        this.serviceType = 'Unknown';
        if (typeof pFable.getUUID == 'function') {
          this.UUID = pFable.getUUID();
        } else {
          this.UUID = "NoFABLESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
        }
        this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);

        // Pull back a few things
        this.log = this.fable.log;
        this.servicesMap = this.fable.servicesMap;
        this.services = this.fable.services;
      });
      _defineProperty(FableServiceProviderBase, "isFableService", true);
      module.exports = FableServiceProviderBase;
      module.exports.CoreServiceProviderBase = require('./Fable-ServiceProviderBase-Preinit.js');
    }, {
      "./Fable-ServiceProviderBase-Preinit.js": 1
    }],
    3: [function (require, module, exports) {
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
        Templates: [],
        DefaultTemplates: [],
        Renderables: [],
        Manifests: {}
      };
      var PictView = /*#__PURE__*/function (_libFableServiceBase) {
        _inherits(PictView, _libFableServiceBase);
        var _super = _createSuper(PictView);
        function PictView(pFable, pOptions, pServiceHash) {
          var _this;
          _classCallCheck(this, PictView);
          // Intersect default options, parent constructor, service information
          var tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
          _this = _super.call(this, pFable, tmpOptions, pServiceHash);
          if (!_this.options.ViewIdentifier) {
            _this.options.ViewIdentifier = "AutoViewID-".concat(_this.fable.getUUID());
          }
          _this.serviceType = 'PictView';
          // Convenience and consistency naming
          _this.pict = _this.fable;
          // Wire in the essential Pict application state
          _this.AppData = _this.fable.AppData;
          _this.initializeTimestamp = false;
          _this.lastSolvedTimestamp = false;
          _this.lastRenderedTimestamp = false;

          // Load all templates from the array in the options
          // Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
          for (var i = 0; i < _this.options.Templates.length; i++) {
            var tmpTemplate = _this.options.Templates[i];
            if (!tmpTemplate.hasOwnProperty('Hash') || !tmpTemplate.hasOwnProperty('Template')) {
              _this.log.error("PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " could not load Template ").concat(i, " in the options array."), tmpTemplate);
            } else {
              if (!tmpTemplate.Source) {
                tmpTemplate.Source = "PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " options object.");
              }
              _this.fable.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
            }
          }

          // Load all default templates from the array in the options
          // Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
          for (var _i = 0; _i < _this.options.DefaultTemplates.length; _i++) {
            var tmpDefaultTemplate = _this.options.DefaultTemplates[_i];
            if (!tmpDefaultTemplate.hasOwnProperty('Postfix') || !tmpDefaultTemplate.hasOwnProperty('Template')) {
              _this.log.error("PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " could not load Default Template ").concat(_i, " in the options array."), tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = "PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " options object.");
              }
              _this.fable.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }

          // Load all renderables
          // Renderables are launchable renderable instructions with templates
          // They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
          // The only parts that are necessary are Identifier and Template
          // A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
          _this.renderables = {};
          for (var _i2 = 0; _i2 < _this.options.Renderables.length; _i2++) {
            var tmpRenderable = _this.options.Renderables[_i2];
            if (!tmpRenderable.hasOwnProperty('RenderableHash') || !tmpRenderable.hasOwnProperty('TemplateHash')) {
              _this.log.error("PictView [".concat(_this.UUID, "]::[").concat(_this.Hash, "] ").concat(_this.options.ViewIdentifier, " could not load Renderable ").concat(_i2, " in the options array."), tmpRenderable);
            } else {
              _this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
            }
          }
          return _this;
        }
        _createClass(PictView, [{
          key: "onBeforeSolve",
          value: function onBeforeSolve() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeSolve:"));
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
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onSolve:"));
            return true;
          }
        }, {
          key: "onSolveAsync",
          value: function onSolveAsync(fCallback) {
            this.onSolve();
            return fCallback();
          }

          // TODO: do we need an asynchronous version of this?
        }, {
          key: "solve",
          value: function solve() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
            this.onBeforeSolve();
            this.onSolve();
            this.onAfterSolve();
            this.lastSolvedTimestamp = this.fable.log.getTimeStamp();
            return true;
          }
        }, {
          key: "solveAsync",
          value: function solveAsync(fCallback) {
            var _this2 = this;
            var tmpAnticipate = this.fable.serviceManager.instantiateServiceProviderWithoutRegistration('Anticipate');
            tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));
            tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterSolve.bind(this));
            tmpAnticipate.wait(function (pError) {
              _this2.log.info("PictView [".concat(_this2.UUID, "]::[").concat(_this2.Hash, "] ").concat(_this2.options.ViewIdentifier, " solveAsync() complete."));
              _this2.lastSolvedTimestamp = _this2.fable.log.getTimeStamp();
              return fCallback(pError);
            });
          }
        }, {
          key: "onAfterSolve",
          value: function onAfterSolve() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterSolve:"));
            return true;
          }
        }, {
          key: "onAfterSolveAsync",
          value: function onAfterSolveAsync(fCallback) {
            this.onAfterSolve();
            return fCallback();
          }
        }, {
          key: "onBeforeInitialize",
          value: function onBeforeInitialize() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeInitialize:"));
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
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onInitialize:"));
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
            if (!this.initializeTimestamp) {
              this.onBeforeInitialize();
              this.onInitialize();
              this.onAfterInitialize();
              this.initializeTimestamp = this.fable.log.getTimeStamp();
              return true;
            } else {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize called but initialization is already completed.  Aborting."));
              return false;
            }
          }
        }, {
          key: "initializeAsync",
          value: function initializeAsync(fCallback) {
            var _this3 = this;
            if (!this.initializeTimestamp) {
              var tmpAnticipate = this.fable.serviceManager.instantiateServiceProviderWithoutRegistration('Anticipate');
              this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " beginning initialization..."));
              tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
              tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
              tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
              tmpAnticipate.wait(function (pError) {
                _this3.initializeTimestamp = _this3.fable.log.getTimeStamp();
                _this3.log.info("PictView [".concat(_this3.UUID, "]::[").concat(_this3.Hash, "] ").concat(_this3.options.ViewIdentifier, " initialization complete."));
                return fCallback();
              });
            } else {
              this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize called but initialization is already completed.  Aborting."));
              // TODO: Should this be an error?
              return fCallback();
            }
          }
        }, {
          key: "onAfterInitialize",
          value: function onAfterInitialize() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterInitialize:"));
            return true;
          }
        }, {
          key: "onAfterInitializeAsync",
          value: function onAfterInitializeAsync(fCallback) {
            this.onAfterInitialize();
            return fCallback();
          }
        }, {
          key: "onBeforeRender",
          value: function onBeforeRender(pRenderable, pRenderDestinationAddress, pData) {
            // Overload this to mess with stuff before the content gets generated from the template
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeRender:"));
            return true;
          }
        }, {
          key: "onBeforeRenderAsync",
          value: function onBeforeRenderAsync(pRenderable, pRenderDestinationAddress, pData, fCallback) {
            this.onBeforeRender(pRenderable, pRenderDestinationAddress, pData);
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
            var tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.RecordAddress === 'string' ? tmpRenderable.RecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            var tmpData = typeof tmpDataAddress === 'string' ? this.fable.DataProvider.getDataByAddress(tmpDataAddress) : undefined;

            // Execute the developer-overridable pre-render behavior
            this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);

            // Generate the content output from the template and data
            var tmpContent = this.fable.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData);

            // Assign the content to the destination address
            this.fable.ContentAssignment.assignContent(tmpRenderDestinationAddress, tmpContent);

            // Execute the developer-overridable post-render behavior
            this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData, tmpContent);
            this.lastRenderedTimestamp = this.fable.log.getTimeStamp();
          }
        }, {
          key: "renderAsync",
          value: function renderAsync(pRenderable, pRenderDestinationAddress, pTemplateDataAddress, fCallback) {
            var _this4 = this;
            var tmpRenderableHash = typeof pRenderable === 'string' ? pRenderable : false;
            if (!tmpRenderableHash) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, "because it is not a valid renderable."));
              return fCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, "because it is not a valid renderable.")));
            }
            var tmpRenderable = this.renderables[tmpRenderableHash];
            if (!tmpRenderable) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist."));
              return fCallback(Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not exist.")));
            }
            var tmpRenderDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
            if (!tmpRenderDestinationAddress) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it does not have a valid destination address."));
              return fCallback(Error("Could not render ".concat(tmpRenderableHash)));
            }
            var tmpDataAddress = typeof pTemplateDataAddress === 'string' ? pTemplateDataAddress : typeof tmpRenderable.RecordAddress === 'string' ? tmpRenderable.RecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            var tmpData = typeof tmpDataAddress === 'string' ? this.fable.DataProvider.getDataByAddress(tmpDataAddress) : undefined;

            // Execute the developer-overridable pre-render behavior
            this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);

            // Render the template (asynchronously)
            this.fable.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData, function (pError, pContent) {
              if (pError) {
                _this4.log.error("PictView [".concat(_this4.UUID, "]::[").concat(_this4.Hash, "] ").concat(_this4.options.ViewIdentifier, " could not render (asynchronously) ").concat(tmpRenderableHash, " (param ").concat(pRenderable, ") because it did not parse the template."), pError);
                return fCallback(pError);
              }

              // Assign the content to the destination address
              _this4.fable.ContentAssignment.assignContent(tmpRenderDestinationAddress, pContent);

              // Execute the developer-overridable post-render behavior
              _this4.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData, pContent);
              _this4.lastRenderedTimestamp = _this4.fable.log.getTimeStamp();
              return fCallback(null, pContent);
            });
          }
        }, {
          key: "onAfterRender",
          value: function onAfterRender() {
            this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterRender:"));
            return true;
          }
        }, {
          key: "onAfterRenderAsync",
          value: function onAfterRenderAsync(fCallback) {
            this.onAfterRender();
            return fCallback();
          }
        }]);
        return PictView;
      }(libFableServiceBase);
      module.exports = PictView;
    }, {
      "fable-serviceproviderbase": 2
    }]
  }, {}, [3])(3);
});