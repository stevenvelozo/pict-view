const libFableServiceBase = require('fable-serviceproviderbase');

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

class PictView extends libFableServiceBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Intersect default options, parent constructor, service information
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
		if (!this.options.ViewIdentifier)
		{
			this.options.ViewIdentifier = `AutoViewID-${this.fable.getUUID()}`;
		}
		this.serviceType = 'PictView';
		// Convenience and consistency naming
		this.pict = this.fable;
		// Wire in the essential Pict application state
		this.AppData = this.pict.AppData;

		this.initializeTimestamp = false;
		this.lastSolvedTimestamp = false;
		this.lastRenderedTimestamp = false;
		this.lastMarshalFromViewTimestamp = false;
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
		this.renderables = {};
		for (let i = 0; i < this.options.Renderables.length; i++)
		{
			let tmpRenderable = this.options.Renderables[i];
			this.addRenderable(this.options.Renderables[i]);
		}
	}

	addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateDataAddress, pDefaultDestinationAddress, pRenderMethod)
	{
		let tmpRenderable = false;

		if (typeof(pRenderableHash) == 'object')
		{
			// The developer passed in the renderable as an object.
			// Use theirs instead!
			tmpRenderable = pRenderableHash;
		}
		else
		{
			let tmpRenderMethod = (typeof(pRenderMethod) !== 'string') ? pRenderMethod : 'replace';
			tmpRenderable = (
				{
					RenderableHash: pRenderableHash,
					TemplateHash: pTemplateHash,
					DefaultTemplateDataAddress: pDefaultTemplateDataAddress,
					DefaultDestinationAddress: pDefaultDestinationAddress,
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
	onBeforeInitialize()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeInitialize:`);
		}
		return true;
	}
	onBeforeInitializeAsync(fCallback)
	{
		this.onBeforeInitialize();
		return fCallback();
	}

	onInitialize()
	{

		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onInitialize:`);
		}
		return true;
	}
	onInitializeAsync(fCallback)
	{
		this.onInitialize();
		return fCallback();
	}

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
				(pError) =>
				{
					this.initializeTimestamp = this.pict.log.getTimeStamp();
					if (this.pict.LogNoisiness > 0)
					{
						this.log.info(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} initialization complete.`);
					}
					return fCallback();
				})
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
	onAfterInitializeAsync(fCallback)
	{
		this.onAfterInitialize();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                            Code Section: Render                            */
	/* -------------------------------------------------------------------------- */
	onBeforeRender(pRenderable, pRenderDestinationAddress, pData)
	{
		// Overload this to mess with stuff before the content gets generated from the template
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeRender:`);
		}
		return true;
	}
	onBeforeRenderAsync(fCallback)
	{
		return fCallback();
	}

	render(pRenderable, pRenderDestinationAddress, pTemplateDataAddress)
	{
		let tmpRenderableHash = (typeof (pRenderable) === 'string') ? pRenderable :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;
		if (!tmpRenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render ${tmpRenderableHash} (param ${pRenderable}) because it is not a valid renderable.`);
			return false;
		}

		let tmpRenderable = this.renderables[tmpRenderableHash];

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

		let tmpDataAddress;
		let tmpData;

		if (typeof(pTemplateDataAddress) === 'object')
		{
			tmpData = pTemplateDataAddress;
			tmpDataAddress = 'Passed in as object';
		}
		else
		{
			tmpDataAddress = (typeof (pTemplateDataAddress) === 'string') ? pTemplateDataAddress :
				(typeof (tmpRenderable.DefaultTemplateRecordAddress) === 'string') ? tmpRenderable.DefaultTemplateRecordAddress :
					(typeof (this.options.DefaultTemplateRecordAddress) === 'string') ? this.options.DefaultTemplateRecordAddress : false;

			tmpData = (typeof (tmpDataAddress) === 'string') ? this.pict.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
		}

		// Execute the developer-overridable pre-render behavior
		this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);

		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpDataAddress}] render:`);
		}
		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Render of Renderable[${tmpRenderableHash}] to Destination [${tmpRenderDestinationAddress}]...`);
		}
		// Generate the content output from the template and data
		let tmpContent = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData, null, [this])

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${tmpContent.length} to Destination [${tmpRenderDestinationAddress}] using render method [${tmpRenderable.RenderMethod}].`);
		}

		// Assign the content to the destination address
		switch(tmpRenderable.RenderMethod)
		{
			case 'append':
				this.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, tmpContent);
				break;
			case 'prepend':
				this.pict.ContentAssignment.prependContent(tmpRenderDestinationAddress, tmpContent);
				break;
			case 'append_once':
				// Try to find the content in the destination address
				let tmpExistingContent = this.pict.ContentAssignment.getElement(`#${tmpRenderableHash}`);
				if (tmpExistingContent.length < 1)
				{
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
		this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData, tmpContent)

		this.lastRenderedTimestamp = this.pict.log.getTimeStamp();

		return true;
	}
	renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateDataAddress, fCallback)
	{
		let tmpRenderableHash = (typeof (pRenderableHash) === 'string') ? pRenderableHash :
			(typeof (this.options.DefaultRenderable) == 'string') ? this.options.DefaultRenderable : false;

		// Allow the callback to be passed in as the last parameter no matter what
		let tmpCallback = (typeof(fCallback) === 'function') ? fCallback :
							(typeof(pTemplateDataAddress) === 'function') ? pTemplateDataAddress :
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
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} renderAsync Auto Callback Error: ${pError}`, pError)						
					}
				};
		}

		if (!tmpRenderableHash)
		{
			this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`);
			return tmpCallback(Error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not asynchronously render ${tmpRenderableHash} (param ${pRenderableHash}because it is not a valid renderable.`));
		}

		let tmpRenderable = this.renderables[tmpRenderableHash];

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

		let tmpDataAddress;
		let tmpData;

		if (typeof(pTemplateDataAddress) === 'object')
		{
			tmpData = pTemplateDataAddress;
			tmpDataAddress = 'Passed in as object';
		}
		else
		{
			tmpDataAddress = (typeof (pTemplateDataAddress) === 'string') ? pTemplateDataAddress :
				(typeof (tmpRenderable.DefaultTemplateRecordAddress) === 'string') ? tmpRenderable.DefaultTemplateRecordAddress :
					(typeof (this.options.DefaultTemplateRecordAddress) === 'string') ? this.options.DefaultTemplateRecordAddress : false;

			tmpData = (typeof (tmpDataAddress) === 'string') ? this.pict.DataProvider.getDataByAddress(tmpDataAddress) : undefined;
		}

		if (this.pict.LogControlFlow)
		{
			this.log.trace(`PICT-ControlFlow VIEW [${this.UUID}]::[${this.Hash}] Renderable[${tmpRenderableHash}] Destination[${tmpRenderDestinationAddress}] TemplateDataAddress[${tmpDataAddress}] renderAsync:`);
		}
		if (this.pict.LogNoisiness > 2)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Beginning Asynchronous Render (callback-style)...`);
		}

		let tmpAnticipate = this.fable.newAnticipate();

		tmpAnticipate.anticipate(
			(fOnBeforeRenderCallback) =>
			{
				this.onBeforeRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);
				this.onBeforeRenderAsync(fOnBeforeRenderCallback);
			});

		tmpAnticipate.anticipate(
			(fAsyncTemplateCallback) =>
			{
				// Render the template (asynchronously)
				this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpData,
					(pError, pContent) =>
					{
						if (pError)
						{
							this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} could not render (asynchronously) ${tmpRenderableHash} (param ${pRenderableHash}) because it did not parse the template.`, pError);
							return fAsyncTemplateCallback(pError);
						}

						if (this.pict.LogNoisiness > 0)
						{
							this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} Assigning Renderable[${tmpRenderableHash}] content length ${pContent.length} to Destination [${tmpRenderDestinationAddress}] using Async render method ${tmpRenderable.RenderMethod}.`);
						}

						// Assign the content to the destination address
						switch(tmpRenderable.RenderMethod)
						{
							case 'append':
								this.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, pContent);
								break;
							case 'prepend':
								this.pict.ContentAssignment.prependContent(tmpRenderDestinationAddress, pContent);
								break;
							case 'append_once':
								// Try to find the content in the destination address
								let tmpExistingContent = this.pict.ContentAssignment.getElement(`#${tmpRenderableHash}`);
								if (tmpExistingContent.length < 1)
								{
									this.pict.ContentAssignment.appendContent(tmpRenderDestinationAddress, pContent);
								}
							case 'replace':
							default:
								this.pict.ContentAssignment.assignContent(tmpRenderDestinationAddress, pContent);
								break;
						}

						// Execute the developer-overridable asynchronous post-render behavior
						this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
						return fAsyncTemplateCallback();
					}, [this]);
			});

		tmpAnticipate.anticipate(
			(fOnAfterRenderCallback) =>
			{
				this.onAfterRender(tmpRenderable, tmpRenderDestinationAddress, tmpData);
				this.onAfterRenderAsync(fOnAfterRenderCallback);
			});

		tmpAnticipate.wait(tmpCallback);
	}
	renderDefaultAsync(fCallback)
	{
		// Render the default renderable
		this.renderAsync(fCallback);
	}
	onAfterRender(pRenderable, pRenderDestinationAddress, pData)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterRender:`);
		}
		return true;
	}
	onAfterRenderAsync(fCallback)
	{
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                            Code Section: Solver                            */
	/* -------------------------------------------------------------------------- */
	onBeforeSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeSolve:`);
		}
		return true;
	}
	onBeforeSolveAsync(fCallback)
	{
		this.onBeforeSolve();
		return fCallback();
	}

	onSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onSolve:`);
		}
		return true;
	}
	onSolveAsync(fCallback)
	{
		this.onSolve();
		return fCallback();
	}

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
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} solveAsync Auto Callback Error: ${pError}`, pError)						
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

	onAfterSolve()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterSolve:`);
		}
		return true;
	}
	onAfterSolveAsync(fCallback)
	{
		this.onAfterSolve();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                     Code Section: Marshal From View                        */
	/* -------------------------------------------------------------------------- */
	onBeforeMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalFromView:`);
		}
		return true;
	}
	onBeforeMarshalFromViewAsync(fCallback)
	{
		this.onBeforeMarshalFromView();
		return fCallback();
	}

	onMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalFromView:`);
		}
		return true;
	}
	onMarshalFromViewAsync(fCallback)
	{

		this.onMarshalFromView();
		return fCallback();
	}

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
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalFromViewAsync Auto Callback Error: ${pError}`, pError)						
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

	onAfterMarshalFromView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalFromView:`);
		}
		return true;
	}
	onAfterMarshalFromViewAsync(fCallback)
	{
		this.onAfterMarshalFromView();
		return fCallback();
	}

	/* -------------------------------------------------------------------------- */
	/*                     Code Section: Marshal To View                          */
	/* -------------------------------------------------------------------------- */
	onBeforeMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onBeforeMarshalToView:`);
		}
		return true;
	}
	onBeforeMarshalToViewAsync(fCallback)
	{
		this.onBeforeMarshalToView();
		return fCallback();
	}

	onMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onMarshalToView:`);
		}
		return true;
	}
	onMarshalToViewAsync(fCallback)
	{
		this.onMarshalToView();
		return fCallback();
	}

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
						this.log.error(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.Name} marshalToViewAsync Auto Callback Error: ${pError}`, pError)						
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

	onAfterMarshalToView()
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`PictView [${this.UUID}]::[${this.Hash}] ${this.options.ViewIdentifier} onAfterMarshalToView:`);
		}
		return true;
	}
	onAfterMarshalToViewAsync(fCallback)
	{
		this.onAfterMarshalToView();
		return fCallback();
	}

	get isPictView()
	{
		return true;
	}
}

module.exports = PictView;