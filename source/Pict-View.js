
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
 * @typedef {'replace' | 'append' | 'prepend' | 'append_once'} RenderMethod
 */
/**
 * @typedef {Object} Renderable
 *
 * @property {string} RenderableHash - A unique hash for the renderable.
 * @property {string} TemplateHash] - The hash of the template to use for rendering this renderable.
 * @property {string} [DefaultTemplateRecordAddress] - The default address for resolving the data record for this renderable.
 * @property {string} [ContentDestinationAddress] - The default address (DOM CSS selector) for rendering the content of this renderable.
 * @property {RenderMethod} [RenderMethod=replace] - The method to use when projecting the renderable to the DOM ('replace', 'append', 'prepend', 'append_once').
 * @property {string} [TestAddress] - The address to use for testing the renderable.
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
		/** @type {Object} */
		this._Package = libPackage;
		// Convenience and consistency naming
		/** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any }} */
		this.pict = this.fable;
		// Wire in the essential Pict application state
		this.AppData = this.pict.AppData;

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
		/** @type {Object<String, Renderable>} */
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
	 * @param {string} pRenderDestinationAddress - The address where the renderable will be rendered.
	 * @param {any} pRecord - The record (data) that will be used to render the renderable.
	 */
	onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord)
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
	 */
	onBeforeRenderAsync(fCallback)
	{
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
	 * @param {string} [pRenderable] - The hash of the renderable to render.
	 * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @return {boolean}
	 */
	render(pRenderable, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		let tmpRenderableHash = (typeof (pRenderable) === 'string') ? pRenderable :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;
		if (!tmpRenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderable}) because it is not a valid renderable.`);
			return false;
		}

		let tmpRenderable;
		if (tmpRenderableHash == '__Virtual')
		{
			tmpRenderable = {
					RenderableHash: '__Virtual',
					TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
					DestinationAddress: pRenderDestinationAddress,
					RenderMethod: 'virtual-assignment'
				}
		}
		else
		{
			tmpRenderable = this.renderables[tmpRenderableHash];
		}

		if (!tmpRenderable)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderable}) because it does not exist.`);
			return false;
		}

		let tmpRenderDestinationAddress = (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
			(typeof (tmpRenderable.ContentDestinationAddress) === 'string') ? tmpRenderable.ContentDestinationAddress :
				(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : false;

		if (!tmpRenderDestinationAddress)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderable}) because it does not have a valid destination address.`);
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
		this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpRecord);

		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] render:`);
		}
		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Render of Renderable[${tmpRenderableHash}] to Destination [${tmpRenderDestinationAddress}]...`);
		}
		// Generate the content output from the template and data
		let tmpContent = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, null, [this]);

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${tmpContent.length} to Destination [${tmpRenderDestinationAddress}] using render method [${tmpRenderable.RenderMethod}].`);
		}

		// Assign the content to the destination address
		this.pict.ContentAssignment.projectContent(tmpRenderable.RenderMethod, tmpRenderDestinationAddress, tmpContent, tmpRenderable.TestAddress);

		// Execute the developer-overridable post-render behavior
		this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpRecord, tmpContent);

		this.lastRenderedTimestamp = this.pict.log.getTimeStamp();

		return true;
	}

	/**
	 * Render a renderable from this view.
	 *
	 * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
	 * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 *
	 * @return {void}
	 */
	renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback)
	{
		let tmpRenderableHash = (typeof (pRenderableHash) === 'string') ? pRenderableHash :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;
		
		// Allow the callback to be passed in as the last parameter no matter what
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback :
							(typeof(pTemplateRecordAddress) === 'function') ? pTemplateRecordAddress :
							(typeof(pRenderDestinationAddress) === 'function') ? pRenderDestinationAddress :
							(typeof(pRenderableHash) === 'function') ? pRenderableHash :
							false;

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
			return tmpCallback(Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`));
		}

		let tmpRenderable;
		if (tmpRenderableHash == '__Virtual')
		{
			tmpRenderable = {
					RenderableHash: '__Virtual',
					TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
					DestinationAddress: pRenderDestinationAddress,
					RenderMethod: 'virtual-assignment'
				}
		}
		else
		{
			tmpRenderable = this.renderables[tmpRenderableHash];
		}

		if (!tmpRenderable)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`);
			return tmpCallback(Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not exist.`));
		}

		let tmpRenderDestinationAddress = (typeof (pRenderDestinationAddress) === 'string') ? pRenderDestinationAddress :
			(typeof (tmpRenderable.ContentDestinationAddress) === 'string') ? tmpRenderable.ContentDestinationAddress :
				(typeof (this.options.DefaultDestinationAddress) === 'string') ? this.options.DefaultDestinationAddress : false;

		if (!tmpRenderDestinationAddress)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderableHash}) because it does not have a valid destination address.`);
			return tmpCallback(Error(`Could not render ${tmpRenderableHash}`));
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
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateRecordAddress[${tmpRecordAddress}] renderAsync:`);
		}
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Asynchronous Render (callback-style)...`);
		}

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			(fOnBeforeRenderCallback) =>
			{
				this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpRecord);
				this.onBeforeRenderAsync(fOnBeforeRenderCallback);
			});

		let tmpContent;
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
						tmpContent = pContent;

						if (this.pict.LogNoisiness > 0)
						{
							this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${pContent.length} to Destination [${tmpRenderDestinationAddress}] using Async render method ${tmpRenderable.RenderMethod}.`);
						}

						this.pict.ContentAssignment.projectContent(tmpRenderable.RenderMethod, tmpRenderDestinationAddress, pContent, tmpRenderable.TestAddress);

						// Execute the developer-overridable asynchronous post-render behavior
						this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
						return fAsyncTemplateCallback();
					}, [this]);
			});

		tmpAnticipate.anticipate(
			(fOnAfterRenderCallback) =>
			{
				this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpRecord, tmpContent);
				this.onAfterRenderAsync(fOnAfterRenderCallback);
			});

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
		let tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
		if (tmpRenderOptions.Valid)
		{
			this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record, null, [this]));
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
	 * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
	 * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
	 */
	basicRenderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback)
	{
		// Allow the callback to be passed in as the last parameter no matter what
		const tmpCallback = (typeof(fCallback) === 'function') ? fCallback :
							(typeof(pTemplateRecordAddress) === 'function') ? pTemplateRecordAddress :
							(typeof(pRenderDestinationAddress) === 'function') ? pRenderDestinationAddress :
							(typeof(pRenderableHash) === 'function') ? pRenderableHash :
							false;

		const tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
		if (tmpRenderOptions.Valid)
		{
			this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record,
				(pError, pContent) =>
				{
					if (pError)
					{
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderOptions.RenderableHash} because it did not parse the template.`, pError);
						return tmpCallback(pError);
					}

					this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, pContent);
					return tmpCallback();
				}, [this]);
		}
		else
		{
			let tmpErrorMessage = `PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not perform a basic render of ${tmpRenderOptions.RenderableHash} because it is not valid.`;
			this.log.error(tmpErrorMessage);
			return tmpCallback(tmpErrorMessage);
		}
	}

	/**
	 * Lifecycle hook that triggers after the view is rendered.
	 *
	 * @param {Renderable} pRenderable - The renderable that was rendered.
	 * @param {string} pRenderDestinationAddress - The address where the renderable was rendered.
	 * @param {any} pRecord - The record (data) that was used by the renderable.
	 * @param {string} pContent - The content that was rendered.
	 */
	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender:`);
		}
		return true;
	}

	/**
	 * Lifecycle hook that triggers after the view is rendered (async flow).
	 *
	 * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
	 */
	onAfterRenderAsync(fCallback)
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

		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : false;
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

		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : false;
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


		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback : false;
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
