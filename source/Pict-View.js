
const libFableServiceBase = require('fable-serviceproviderbase');

const libPackage = require('../package.json');

const defaultPictViewSettings = (
	{
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
	});

/** @typedef {(error?: Error) => void} ErrorCallback */
/** @typedef {number | boolean} PictTimestamp */

/**
 * @typedef {'replace' | 'append' | 'prepend' | 'append_once' | 'virtual-assignment'} RenderMethod
 */
/**
 * @typedef {Object} Renderable
 *
 * @property {string} RenderableHash - A unique hash for the renderable.
 * @property {string} TemplateHash - The hash of the template to use for rendering this renderable.
 * @property {string} [DefaultTemplateRecordAddress] - The default address for resolving the data record for this renderable.
 * @property {string} [ContentDestinationAddress] - The default address (DOM CSS selector) for rendering the content of this renderable.
 * @property {RenderMethod} [RenderMethod=replace] - The method to use when projecting the renderable to the DOM ('replace', 'append', 'prepend', 'append_once', 'virtual-assignment').
 * @property {string} [TestAddress] - The address to use for testing the renderable.
 * @property {string} [TransactionHash] - The transaction hash for the root renderable.
 * @property {string} [RootRenderableViewHash] - The hash of the root renderable.
 * @property {string} [Content] - The rendered content for this renderable, if applicable.
 */

/**
 * Represents a view in the Pict ecosystem.
 */
class PictView extends libFableServiceBase
{
	/**
	 * @param {any} pFable - The Fable object that this service is attached to.
	 * @param {any} [pOptions] - (optional) The options for this service.
	 * @param {string} [pServiceHash] - (optional) The hash of the service.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		// Intersect default options, parent constructor, service information
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
		//FIXME: add types to fable and ancillaries
		/** @type {any} */
		this.fable;
		/** @type {any} */
		this.options;
		/** @type {String} */
		this.UUID;
		/** @type {String} */
		this.Hash;
		/** @type {any} */
		this.log;

		if (!this.options.ViewIdentifier)
		{
			this.options.ViewIdentifier = `AutoViewID-${this.fable.getUUID()}`;
		}
		this.serviceType = 'PictView';
		/** @type {Record<string, any>} */
		this._Package = libPackage;
		// Convenience and consistency naming
		/** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */
		this.pict = this.fable;
		// Wire in the essential Pict application state
		this.AppData = this.pict.AppData;
		this.Bundle = this.pict.Bundle;

		/** @type {PictTimestamp} */
		this.initializeTimestamp = false;
		/** @type {PictTimestamp} */
		this.lastSolvedTimestamp = false;
		/** @type {PictTimestamp} */
		this.lastRenderedTimestamp = false;
		/** @type {PictTimestamp} */
		this.lastMarshalFromViewTimestamp = false;
		/** @type {PictTimestamp} */
		this.lastMarshalToViewTimestamp = false;

		this.pict.instantiateServiceProviderIfNotExists('TransactionTracking');

		// Load all templates from the array in the options
		// Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
		for (let i = 0; i < this.options.Templates.length; i++)
		{
			let tmpTemplate = this.options.Templates[i];

			if (!('Hash' in tmpTemplate) || !('Template' in tmpTemplate))
			{
				this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Template ${i} in the options array.`, tmpTemplate);
			}
			else
			{
				if (!tmpTemplate.Source)
				{
					tmpTemplate.Source = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;
				}
				this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
			}
		}

		// Load all default templates from the array in the options
		// Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
		for (let i = 0; i < this.options.DefaultTemplates.length; i++)
		{
			let tmpDefaultTemplate = this.options.DefaultTemplates[i];

			if (!('Postfix' in tmpDefaultTemplate) || !('Template' in tmpDefaultTemplate))
			{
				this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Default Template ${i} in the options array.`, tmpDefaultTemplate);
			}
			else
			{
				if (!tmpDefaultTemplate.Source)
				{
					tmpDefaultTemplate.Source = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} options object.`;
				}
				this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
			}
		}

		// Load the CSS if it's available
		if (this.options.CSS)
		{
			let tmpCSSHash = this.options.CSSHash ? this.options.CSSHash : `View-${this.options.ViewIdentifier}`;
			let tmpCSSProvider = this.options.CSSProvider ? this.options.CSSProvider : tmpCSSHash;
			this.pict.CSSMap.addCSS(tmpCSSHash, this.options.CSS, tmpCSSProvider, this.options.CSSPriority);
		}

		// Load all renderables
		// Renderables are launchable renderable instructions with templates
		// They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
		// The only parts that are necessary are Identifier and Template
		// A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
		/** @type {Record<String, Renderable>} */
		this.renderables = {};
		for (let i = 0; i < this.options.Renderables.length; i++)
		{
			/** @type {Renderable} */
			let tmpRenderable = this.options.Renderables[i];
			this.addRenderable(tmpRenderable);
		}
	}

	/**
	 * Adds a renderable to the view.
	 *
	 * @param {string | Renderable} pRenderableHash - The hash of the renderable, or a renderable object.
	 * @param {string} [pTemplateHash] - (optional) The hash of the template for the renderable.
	 * @param {string} [pDefaultTemplateRecordAddress] - (optional) The default data address for the template.
	 * @param {string} [pDefaultDestinationAddress] - (optional) The default destination address for the renderable.
	 * @param {RenderMethod} [pRenderMethod=replace] - (optional) The method to use when rendering the renderable (ex. 'replace').
	 */
	addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateRecordAddress, pDefaultDestinationAddress, pRenderMethod)
	{
		/** @type {Renderable} */
		let tmpRenderable;

		if (typeof(pRenderableHash) == 'object')
		{
			// The developer passed in the renderable as an object.
			// Use theirs instead!
			tmpRenderable = pRenderableHash;
		}
		else
		{
			/** @type {RenderMethod} */
			let tmpRenderMethod = (typeof(pRenderMethod) !== 'string') ? pRenderMethod : 'replace';
			tmpRenderable = (
				{
					RenderableHash: pRenderableHash,
					TemplateHash: pTemplateHash,
					DefaultTemplateRecordAddress: pDefaultTemplateRecordAddress,
					ContentDestinationAddress: pDefaultDestinationAddress,
					RenderMethod: tmpRenderMethod
				});
		}

		if ((typeof(tmpRenderable.RenderableHash) != 'string') || (typeof(tmpRenderable.TemplateHash) != 'string'))
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not load Renderable; RenderableHash or TemplateHash are invalid.`, tmpRenderable);
		}
		else
		{
			if (this.pict.LogNoisiness > 0)
			{
				this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} adding renderable [${tmpRenderable.RenderableHash}] pointed to template ${tmpRenderable.TemplateHash}.`);
			}

			this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                        Code Section: Initialization                        */
	/* -------------------------------------------------------------------------- */
	/**
	 * Lifecycle hook that triggers before the view is initialized.
	 */
	onBeforeInitialize()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeInitialize:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onBeforeInitializeAsync(fCallback)
	{
		this.onBeforeInitialize();
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers when the view is initialized.
	 */
	onInitialize()
	{

		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onInitialize:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers when the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onInitializeAsync(fCallback)
	{
		this.onInitialize();
		return fCallback();
	}

	/**
	 * Performs view initialization.
	 */
	initialize()
	{
		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize:`);
		}

		if (!this.initializeTimestamp)
		{
			this.onBeforeInitialize();
			this.onInitialize();
			this.onAfterInitialize();
			this.initializeTimestamp = this.pict.log.getTimeStamp();
			return true;
		}
		else
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialize called but initialization is already completed.  Aborting.`);
			return false;
		}
	}

	/**
	 * Performs view initialization (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	initializeAsync(fCallback)
	{
		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initializeAsync:`);
		}

		if (!this.initializeTimestamp)
		{
			let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

			if (this.pict.LogNoisiness > 0)
			{
				this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} beginning initialization...`);
			}

			tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
			tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
			tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));

			tmpAnticipate.wait(
				/** @param {Error} pError */
				(pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization failed: ${pError.message || pError}`, { stack: pError.stack });
					}
					this.initializeTimestamp = this.pict.log.getTimeStamp();
					if (this.pict.LogNoisiness > 0)
					{
						this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization complete.`);
					}
					return fCallback();
				});
		}
		else
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} async initialize called but initialization is already completed.  Aborting.`);
			// TODO: Should this be an error?
			return fCallback();
		}
	}

	onAfterInitialize()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterInitialize:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after the view is initialized (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onAfterInitializeAsync(fCallback)
	{
		this.onAfterInitialize();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                            Code Section: Render                            */
	/* -------------------------------------------------------------------------- */
	/**
	 * Lifecycle hook that triggers before the view is rendered.
	 *
	 * @param {Renderable} pRenderable - The renderable that will be rendered.
	 */
	onBeforeRender(pRenderable)
	{
		// Overload this to mess with stuff before the content gets generated from the template
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeRender:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before the view is rendered (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that will be rendered.
	 */
	onBeforeRenderAsync(fCallback, pRenderable)
	{
		this.onBeforeRender(pRenderable);
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers before the view is projected into the DOM.
	 *
	 * @param {Renderable} pRenderable - The renderable that will be projected.
	 */
	onBeforeProject(pRenderable)
	{
		// Overload this to mess with stuff before the content gets generated from the template
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeProject:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before the view is projected into the DOM (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that will be projected.
	 */
	onBeforeProjectAsync(fCallback, pRenderable)
	{
		this.onBeforeProject(pRenderable);
		return fCallback();
	}

	/**
	 * Builds the render options for a renderable.
	 *
	 * For DRY purposes on the three flavors of render.
	 *
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */
	buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		let tmpRenderOptions = {Valid: true};
		tmpRenderOptions.RenderableHash = (typeof (pRenderableHash) === 'string') ? pRenderableHash :
								(typeof (this.options.DefaultRenderable) == 'string') ?
								this.options.DefaultRenderable : false;
		if (!tmpRenderOptions.RenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not find a suitable RenderableHash ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);
			tmpRenderOptions.Valid = false;
		}

		tmpRenderOptions.Renderable = this.renderables[tmpRenderOptions.RenderableHash];
		if (!tmpRenderOptions.Renderable)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not exist.`);
			tmpRenderOptions.Valid = false;
		}

		tmpRenderOptions.DestinationAddress = (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
			(typeof (tmpRenderOptions.Renderable.ContentDestinationAddress) === 'string') ? tmpRenderOptions.Renderable.ContentDestinationAddress :
				(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : false;
		if (!tmpRenderOptions.DestinationAddress)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderOptions.RenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address (param ${pRenderDestinationAddress}).`);
			tmpRenderOptions.Valid = false;
		}

		if (typeof(pTemplateRecordAddress) === 'object')
		{
			tmpRenderOptions.RecordAddress = 'Passed in as object';
			tmpRenderOptions.Record = pTemplateRecordAddress;
		}
		else
		{
			tmpRenderOptions.RecordAddress = (typeof (pTemplateRecordAddress) === 'string') ? pTemplateRecordAddress :
				(typeof (tmpRenderOptions.Renderable.DefaultTemplateRecordAddress) === 'string') ? tmpRenderOptions.Renderable.DefaultTemplateRecordAddress :
				(typeof (this.options.DefaultTemplateRecordAddress) === 'string') ? this.options.DefaultTemplateRecordAddress : false;
			tmpRenderOptions.Record = (typeof (tmpRenderOptions.RecordAddress) === 'string') ? this.pict.DataProvider.getDataByAddress(tmpRenderOptions.RecordAddress) : undefined;
		}

		return tmpRenderOptions;
	}

	/**
	 * Assigns the content to the destination address.
	 *
	 * For DRY purposes on the three flavors of render.
	 *
	 * @param {Renderable} pRenderable - The renderable to render.
	 * @param {string} pRenderDestinationAddress - The address where the renderable will be rendered.
	 * @param {string} pContent - The content to render.
	 * @returns {boolean} - Returns true if the content was assigned successfully.
	 * @memberof PictView
	 */
	assignRenderContent(pRenderable, pRenderDestinationAddress, pContent)
	{
		return this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderDestinationAddress, pContent, pRenderable.TestAddress);
	}

	/**
	 * Render a renderable from this view.
	 *
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @return {boolean}
	 */
	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable)
	{
		return this.renderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable);
	}

	/**
	 * Render a renderable from this view, providing a specifici scope for the template.
	 *
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @return {boolean}
	 */
	renderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable)
	{
		let tmpRenderableHash = (typeof (pRenderableHash) === 'string') ? pRenderableHash :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;
		if (!tmpRenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it is not a valid renderable.`);
			return false;
		}

		/** @type {Renderable} */
		let tmpRenderable;
		if (tmpRenderableHash == '__Virtual')
		{
			tmpRenderable = {
				RenderableHash: '__Virtual',
				TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
				ContentDestinationAddress: (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
					(typeof (tmpRenderable.ContentDestinationAddress) === 'string') ? tmpRenderable.ContentDestinationAddress :
					(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : null,
				RenderMethod: 'virtual-assignment',
				TransactionHash: pRootRenderable && pRootRenderable.TransactionHash,
				RootRenderableViewHash: pRootRenderable && pRootRenderable.RootRenderableViewHash,
			};
		}
		else
		{
			tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
			tmpRenderable.ContentDestinationAddress = (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
				(typeof (tmpRenderable.ContentDestinationAddress) === 'string') ? tmpRenderable.ContentDestinationAddress :
				(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : null;
		}

		if (!tmpRenderable.TransactionHash)
		{
			tmpRenderable.TransactionHash = `ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;
			tmpRenderable.RootRenderableViewHash = this.Hash;
			this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
		}

		if (!tmpRenderable)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);
			return false;
		}

		if (!tmpRenderable.ContentDestinationAddress)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);
			return false;
		}

		let tmpRecordAddress;
		let tmpRecord;

		if (typeof(pTemplateRecordAddress) === 'object')
		{
			tmpRecord = pTemplateRecordAddress;
			tmpRecordAddress = 'Passed in as object';
		}
		else
		{
			tmpRecordAddress = (typeof (pTemplateRecordAddress) === 'string') ? pTemplateRecordAddress :
				(typeof (tmpRenderable.DefaultTemplateRecordAddress) === 'string') ? tmpRenderable.DefaultTemplateRecordAddress :
					(typeof (this.options.DefaultTemplateRecordAddress) === 'string') ? this.options.DefaultTemplateRecordAddress : false;

			tmpRecord = (typeof (tmpRecordAddress) === 'string') ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
		}

		// Execute the developer-overridable pre-render behavior
		this.onBeforeRender(tmpRenderable);

		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] render:`);
		}
		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Render of Renderable[${tmpRenderableHash}] to Destination [${tmpRenderable.ContentDestinationAddress}]...`);
		}
		// Generate the content output from the template and data
		tmpRenderable.Content = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, null, [this], pScope, { RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable });

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${tmpRenderable.Content.length} to Destination [${tmpRenderable.ContentDestinationAddress}] using render method [${tmpRenderable.RenderMethod}].`);
		}

		this.onBeforeProject(tmpRenderable);
		this.onProject(tmpRenderable);

		if (tmpRenderable.RenderMethod !== 'virtual-assignment')
		{
			this.onAfterProject(tmpRenderable);

			// Execute the developer-overridable post-render behavior
			this.onAfterRender(tmpRenderable);
		}

		return true;
	}

	/**
	 * Render a renderable from this view.
	 *
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 *
	 * @return {void}
	 */
	renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback)
	{
		return this.renderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback);
	}

	/**
	 * Render a renderable from this view.
	 *
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 *
	 * @return {void}
	 */
	renderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback)
	{
		let tmpRenderableHash = (typeof (pRenderableHash) === 'string') ? pRenderableHash :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;

		// Allow the callback to be passed in as the last parameter no matter what
		/** @type {ErrorCallback} */
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback :
							(typeof(pTemplateRecordAddress) === 'function') ? pTemplateRecordAddress :
							(typeof(pRenderDestinationAddress) === 'function') ? pRenderDestinationAddress :
							(typeof(pRenderableHash) === 'function') ? pRenderableHash :
							(typeof(pRootRenderable) === 'function') ? pRootRenderable :
							null;

		if (!tmpCallback)
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
			tmpCallback = (pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`, pError);
					}
				};
		}

		if (!tmpRenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);
			return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`));
		}

		/** @type {Renderable} */
		let tmpRenderable;
		if (tmpRenderableHash == '__Virtual')
		{
			tmpRenderable = {
				RenderableHash: '__Virtual',
				TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
				ContentDestinationAddress: (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress : (typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : null,
				RenderMethod: 'virtual-assignment',
				TransactionHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.TransactionHash,
				RootRenderableViewHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.RootRenderableViewHash,
			};
		}
		else
		{
			tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
			tmpRenderable.ContentDestinationAddress = (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
				(typeof (tmpRenderable.ContentDestinationAddress) === 'string') ? tmpRenderable.ContentDestinationAddress :
				(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : null;
		}

		if (!tmpRenderable.TransactionHash)
		{
			tmpRenderable.TransactionHash = `ViewRender-V-${this.options.ViewIdentifier}-R-${tmpRenderableHash}-U-${this.pict.getUUID()}`;
			tmpRenderable.RootRenderableViewHash = this.Hash;
			this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
		}

		if (!tmpRenderable)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);
			return tmpCallback(new Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`));
		}

		if (!tmpRenderable.ContentDestinationAddress)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);
			return tmpCallback(new Error(`Could not render ${tmpRenderableHash}`));
		}

		let tmpRecordAddress;
		let tmpRecord;

		if (typeof(pTemplateRecordAddress) === 'object')
		{
			tmpRecord = pTemplateRecordAddress;
			tmpRecordAddress = 'Passed in as object';
		}
		else
		{
			tmpRecordAddress = (typeof (pTemplateRecordAddress) === 'string') ? pTemplateRecordAddress :
				(typeof (tmpRenderable.DefaultTemplateRecordAddress) === 'string') ? tmpRenderable.DefaultTemplateRecordAddress :
					(typeof (this.options.DefaultTemplateRecordAddress) === 'string') ? this.options.DefaultTemplateRecordAddress : false;

			tmpRecord = (typeof (tmpRecordAddress) === 'string') ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
		}

		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderable.ContentDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] renderAsync:`);
		}
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Asynchronous Render (callback-style)...`);
		}

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			(fOnBeforeRenderCallback) =>
			{
				this.onBeforeRenderAsync(fOnBeforeRenderCallback, tmpRenderable);
			});

		tmpAnticipate.anticipate(
			(fAsyncTemplateCallback) =>
			{
				// Render the template (asynchronously)
				this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord,
					(pError, pContent) =>
					{
						if (pError)
						{
							this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderableHash} (param ${pRenderableHash}) because it did not parse the template.`, pError);
							return fAsyncTemplateCallback(pError);
						}
						tmpRenderable.Content = pContent;

						return fAsyncTemplateCallback();
					}, [this], pScope, { RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable });
			});

		tmpAnticipate.anticipate((fNext) =>
		{
			this.onBeforeProjectAsync(fNext, tmpRenderable);
		});
		tmpAnticipate.anticipate((fNext) =>
		{
			this.onProjectAsync(fNext, tmpRenderable);
		});

		if (tmpRenderable.RenderMethod !== 'virtual-assignment')
		{
			tmpAnticipate.anticipate((fNext) =>
			{
				this.onAfterProjectAsync(fNext, tmpRenderable);
			});

			// Execute the developer-overridable post-render behavior
			tmpAnticipate.anticipate((fNext) =>
			{
				this.onAfterRenderAsync(fNext, tmpRenderable);
			});
		}

		tmpAnticipate.wait(tmpCallback);
	}

	/**
	 * Renders the default renderable.
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	renderDefaultAsync(fCallback)
	{
		// Render the default renderable
		this.renderAsync(fCallback);
	}

	/**
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */
	basicRender(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		return this.basicRenderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
	}

	/**
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 */
	basicRenderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		let tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
		if (tmpRenderOptions.Valid)
		{
			this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record, null, [this], pScope, { RootRenderable: tmpRenderOptions.Renderable }));
			return true;
		}
		else
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`);
			return false;
		}
	}

	/**
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 */
	basicRenderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback)
	{
		return this.basicRenderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback);
	}

	/**
	 * @param {any} pScope - The scope to use for the template rendering.
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 */
	basicRenderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback)
	{
		// Allow the callback to be passed in as the last parameter no matter what
		/** @type {ErrorCallback} */
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback :
							(typeof(pTemplateRecordAddress) === 'function') ? pTemplateRecordAddress :
							(typeof(pRenderDestinationAddress) === 'function') ? pRenderDestinationAddress :
							(typeof(pRenderableHash) === 'function') ? pRenderableHash :
							null;
		if (!tmpCallback)
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
			tmpCallback = (pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} basicRenderAsync Auto Callback Error: ${pError}`, pError);
					}
				};
		}

		const tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
		if (tmpRenderOptions.Valid)
		{
			this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record,
				/**
				 * @param {Error} [pError] - The error that occurred during template parsing.
				 * @param {string} [pContent] - The content that was rendered from the template.
				 */
				(pError, pContent) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderOptions.RenderableHash} because it did not parse the template.`, pError);
						return tmpCallback(pError);
					}

					this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, pContent);
					return tmpCallback();
				}, [this], pScope, { RootRenderable: tmpRenderOptions.Renderable });
		}
		else
		{
			let tmpErrorMessage = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`;
			this.log.error(tmpErrorMessage);
			return tmpCallback(new Error(tmpErrorMessage));
		}
	}

	/**
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */
	onProject(pRenderable)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onProject:`);
		}
		if (pRenderable.RenderMethod === 'virtual-assignment')
		{
			this.pict.TransactionTracking.pushToTransactionQueue(pRenderable.TransactionHash, { ViewHash: this.Hash, Renderable: pRenderable }, 'Deferred-Post-Content-Assignment');
		}

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${pRenderable.RenderableHash}] content length ${pRenderable.Content.length} to Destination [${pRenderable.ContentDestinationAddress}] using Async render method ${pRenderable.RenderMethod}.`);
		}

		// Assign the content to the destination address
		this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderable.ContentDestinationAddress, pRenderable.Content, pRenderable.TestAddress);

		this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
	}

	/**
	 * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
	 *
	 * @param {(error?: Error, content?: string) => void} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that is being projected.
	 */
	onProjectAsync(fCallback, pRenderable)
	{
		this.onProject(pRenderable);
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers after the view is rendered.
	 *
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */
	onAfterRender(pRenderable)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender:`);
		}
		if (pRenderable && pRenderable.RootRenderableViewHash === this.Hash)
		{
			const tmpTransactionQueue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
			for (const tmpEvent of tmpTransactionQueue)
			{
				const tmpView = this.pict.views[tmpEvent.Data.ViewHash];
				if (!tmpView)
				{
					this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${tmpEvent.Data.ViewHash}.`);
					continue;
				}
				tmpView.onAfterProject();

				// Execute the developer-overridable post-render behavior
				tmpView.onAfterRender(tmpEvent.Data.Renderable);
			}
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after the view is rendered (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 */
	onAfterRenderAsync(fCallback, pRenderable)
	{
		this.onAfterRender(pRenderable);
		const tmpAnticipate = this.fable.newAnticipate();
		if (pRenderable && pRenderable.RootRenderableViewHash === this.Hash)
		{
			const queue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
			for (const event of queue)
			{
				/** @type {PictView} */
				const tmpView = this.pict.views[event.Data.ViewHash];
				if (!tmpView)
				{
					this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRenderAsync: Could not find view for transaction hash ${pRenderable.TransactionHash} and ViewHash ${event.Data.ViewHash}.`);
					continue;
				}
				tmpAnticipate.anticipate(tmpView.onAfterProjectAsync.bind(tmpView));
				tmpAnticipate.anticipate((fNext) =>
				{
					tmpView.onAfterRenderAsync(fNext, event.Data.Renderable);
				});

				// Execute the developer-overridable post-render behavior
			}
		}
		return tmpAnticipate.wait(fCallback);
	}

	/**
	 * Lifecycle hook that triggers after the view is projected into the DOM.
	 *
	 * @param {Renderable} pRenderable - The renderable that was projected.
	 */
	onAfterProject(pRenderable)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterProject:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 * @param {Renderable} pRenderable - The renderable that was projected.
	 */
	onAfterProjectAsync(fCallback, pRenderable)
	{
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                            Code Section: Solver                            */
	/* -------------------------------------------------------------------------- */
	/**
	 * Lifecycle hook that triggers before the view is solved.
	 */
	onBeforeSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeSolve:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onBeforeSolveAsync(fCallback)
	{
		this.onBeforeSolve();
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers when the view is solved.
	 */
	onSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onSolve:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers when the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onSolveAsync(fCallback)
	{
		this.onSolve();
		return fCallback();
	}

	/**
	 * Performs view solving and triggers lifecycle hooks.
	 *
	 * @return {boolean} - True if the view was solved successfully, false otherwise.
	 */
	solve()
	{
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
		}
		this.onBeforeSolve();
		this.onSolve();
		this.onAfterSolve();
		this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
		return true;
	}

	/**
	 * Performs view solving and triggers lifecycle hooks (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	solveAsync(fCallback)
	{
		let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

		/** @type {ErrorCallback} */
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : null;
		if (!tmpCallback)
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
			tmpCallback = (pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`, pError);
					}
				};
		}

		tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));
		tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
		tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));

		tmpAnticipate.wait(
			(pError) =>
			{
				if (this.pict.LogNoisiness > 2)
				{
					this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} solveAsync() complete.`);
				}
				this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
				return tmpCallback(pError);
			});
	}

	/**
	 * Lifecycle hook that triggers after the view is solved.
	 */
	onAfterSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterSolve:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after the view is solved (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onAfterSolveAsync(fCallback)
	{
		this.onAfterSolve();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                     Code Section: Marshal From View                        */
	/* -------------------------------------------------------------------------- */
	/**
	 * Lifecycle hook that triggers before data is marshaled from the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */
	onBeforeMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalFromView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onBeforeMarshalFromViewAsync(fCallback)
	{
		this.onBeforeMarshalFromView();
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers when data is marshaled from the view.
	 */
	onMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalFromView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers when data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onMarshalFromViewAsync(fCallback)
	{

		this.onMarshalFromView();
		return fCallback();
	}

	/**
	 * Marshals data from the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */
	marshalFromView()
	{
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
		}
		this.onBeforeMarshalFromView();
		this.onMarshalFromView();
		this.onAfterMarshalFromView();
		this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
		return true;
	}

	/**
	 * Marshals data from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	marshalFromViewAsync(fCallback)
	{
		let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

		/** @type {ErrorCallback} */
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : null;
		if (!tmpCallback)
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
			tmpCallback = (pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync Auto Callback Error: ${pError}`, pError);
					}
				};
		}

		tmpAnticipate.anticipate(this.onBeforeMarshalFromViewAsync.bind(this));
		tmpAnticipate.anticipate(this.onMarshalFromViewAsync.bind(this));
		tmpAnticipate.anticipate(this.onAfterMarshalFromViewAsync.bind(this));

		tmpAnticipate.wait(
			(pError) =>
			{
				if (this.pict.LogNoisiness > 2)
				{
					this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalFromViewAsync() complete.`);
				}
				this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
				return tmpCallback(pError);
			});
	}

	/**
	 * Lifecycle hook that triggers after data is marshaled from the view.
	 */
	onAfterMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalFromView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after data is marshaled from the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onAfterMarshalFromViewAsync(fCallback)
	{
		this.onAfterMarshalFromView();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                     Code Section: Marshal To View                          */
	/* -------------------------------------------------------------------------- */
	/**
	 * Lifecycle hook that triggers before data is marshaled into the view.
	 */
	onBeforeMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalToView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers before data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onBeforeMarshalToViewAsync(fCallback)
	{
		this.onBeforeMarshalToView();
		return fCallback();
	}

	/**
	 * Lifecycle hook that triggers when data is marshaled into the view.
	 */
	onMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalToView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers when data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onMarshalToViewAsync(fCallback)
	{
		this.onMarshalToView();
		return fCallback();
	}

	/**
	 * Marshals data into the view.
	 *
	 * @return {boolean} - True if the operation was successful, false otherwise.
	 */
	marshalToView()
	{
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} executing solve() function...`);
		}
		this.onBeforeMarshalToView();
		this.onMarshalToView();
		this.onAfterMarshalToView();
		this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
		return true;
	}

	/**
	 * Marshals data into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	marshalToViewAsync(fCallback)
	{
		let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');


		/** @type {ErrorCallback} */
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : null;
		if (!tmpCallback)
		{
			this.log.warn(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions.`);
			tmpCallback = (pError) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync Auto Callback Error: ${pError}`, pError);
					}
				};
		}
		tmpAnticipate.anticipate(this.onBeforeMarshalToViewAsync.bind(this));
		tmpAnticipate.anticipate(this.onMarshalToViewAsync.bind(this));
		tmpAnticipate.anticipate(this.onAfterMarshalToViewAsync.bind(this));

		tmpAnticipate.wait(
			(pError) =>
			{
				if (this.pict.LogNoisiness > 2)
				{
					this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} marshalToViewAsync() complete.`);
				}
				this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
				return tmpCallback(pError);
			});
	}

	/**
	 * Lifecycle hook that triggers after data is marshaled into the view.
	 */
	onAfterMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalToView:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after data is marshaled into the view (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onAfterMarshalToViewAsync(fCallback)
	{
		this.onAfterMarshalToView();
		return fCallback();
	}

	/** @return {boolean} - True if the object is a PictView. */
	get isPictView()
	{
		return true;
	}
}

module.exports = PictView;
