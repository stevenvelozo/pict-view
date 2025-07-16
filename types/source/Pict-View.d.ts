export = PictView;
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
declare class PictView {
    /**
     * @param {any} pFable - The Fable object that this service is attached to.
     * @param {any} [pOptions] - (optional) The options for this service.
     * @param {string} [pServiceHash] - (optional) The hash of the service.
     */
    constructor(pFable: any, pOptions?: any, pServiceHash?: string);
    /** @type {any} */
    fable: any;
    /** @type {any} */
    options: any;
    /** @type {String} */
    UUID: string;
    /** @type {String} */
    Hash: string;
    /** @type {any} */
    log: any;
    serviceType: string;
    /** @type {Record<string, any>} */
    _Package: Record<string, any>;
    /** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */
    pict: import("pict") & {
        log: any;
        instantiateServiceProviderWithoutRegistration: (hash: string) => any;
        instantiateServiceProviderIfNotExists: (hash: string) => any;
        TransactionTracking: import("pict/types/source/services/Fable-Service-TransactionTracking");
    };
    AppData: Record<string, any>;
    Bundle: Record<string, any>;
    /** @type {PictTimestamp} */
    initializeTimestamp: PictTimestamp;
    /** @type {PictTimestamp} */
    lastSolvedTimestamp: PictTimestamp;
    /** @type {PictTimestamp} */
    lastRenderedTimestamp: PictTimestamp;
    /** @type {PictTimestamp} */
    lastMarshalFromViewTimestamp: PictTimestamp;
    /** @type {PictTimestamp} */
    lastMarshalToViewTimestamp: PictTimestamp;
    /** @type {Record<String, Renderable>} */
    renderables: Record<string, Renderable>;
    /**
     * Adds a renderable to the view.
     *
     * @param {string | Renderable} pRenderableHash - The hash of the renderable, or a renderable object.
     * @param {string} [pTemplateHash] - (optional) The hash of the template for the renderable.
     * @param {string} [pDefaultTemplateRecordAddress] - (optional) The default data address for the template.
     * @param {string} [pDefaultDestinationAddress] - (optional) The default destination address for the renderable.
     * @param {RenderMethod} [pRenderMethod=replace] - (optional) The method to use when rendering the renderable (ex. 'replace').
     */
    addRenderable(pRenderableHash: string | Renderable, pTemplateHash?: string, pDefaultTemplateRecordAddress?: string, pDefaultDestinationAddress?: string, pRenderMethod?: RenderMethod): void;
    /**
     * Lifecycle hook that triggers before the view is initialized.
     */
    onBeforeInitialize(): boolean;
    /**
     * Lifecycle hook that triggers before the view is initialized (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onBeforeInitializeAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers when the view is initialized.
     */
    onInitialize(): boolean;
    /**
     * Lifecycle hook that triggers when the view is initialized (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onInitializeAsync(fCallback: ErrorCallback): void;
    /**
     * Performs view initialization.
     */
    initialize(): boolean;
    /**
     * Performs view initialization (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    initializeAsync(fCallback: ErrorCallback): void;
    onAfterInitialize(): boolean;
    /**
     * Lifecycle hook that triggers after the view is initialized (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onAfterInitializeAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers before the view is rendered.
     *
     * @param {Renderable} pRenderable - The renderable that will be rendered.
     */
    onBeforeRender(pRenderable: Renderable): boolean;
    /**
     * Lifecycle hook that triggers before the view is rendered (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     * @param {Renderable} pRenderable - The renderable that will be rendered.
     */
    onBeforeRenderAsync(fCallback: ErrorCallback, pRenderable: Renderable): void;
    /**
     * Lifecycle hook that triggers before the view is projected into the DOM.
     *
     * @param {Renderable} pRenderable - The renderable that will be projected.
     */
    onBeforeProject(pRenderable: Renderable): boolean;
    /**
     * Lifecycle hook that triggers before the view is projected into the DOM (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     * @param {Renderable} pRenderable - The renderable that will be projected.
     */
    onBeforeProjectAsync(fCallback: ErrorCallback, pRenderable: Renderable): void;
    /**
     * Builds the render options for a renderable.
     *
     * For DRY purposes on the three flavors of render.
     *
     * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
     * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
     */
    buildRenderOptions(pRenderableHash?: string | ErrorCallback, pRenderDestinationAddress?: string | ErrorCallback, pTemplateRecordAddress?: string | object | ErrorCallback): {
        Valid: boolean;
    };
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
    assignRenderContent(pRenderable: Renderable, pRenderDestinationAddress: string, pContent: string): boolean;
    /**
     * Render a renderable from this view.
     *
     * @param {string} [pRenderableHash] - The hash of the renderable to render.
     * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
     * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
     * @return {boolean}
     */
    render(pRenderableHash?: string, pRenderDestinationAddress?: string, pTemplateRecordAddress?: string | object, pRootRenderable?: Renderable): boolean;
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
    renderWithScope(pScope: any, pRenderableHash?: string, pRenderDestinationAddress?: string, pTemplateRecordAddress?: string | object, pRootRenderable?: Renderable): boolean;
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
    renderAsync(pRenderableHash?: string | ErrorCallback, pRenderDestinationAddress?: string | ErrorCallback, pTemplateRecordAddress?: string | object | ErrorCallback, pRootRenderable?: Renderable | ErrorCallback, fCallback?: ErrorCallback): void;
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
    renderWithScopeAsync(pScope: any, pRenderableHash?: string | ErrorCallback, pRenderDestinationAddress?: string | ErrorCallback, pTemplateRecordAddress?: string | object | ErrorCallback, pRootRenderable?: Renderable | ErrorCallback, fCallback?: ErrorCallback): void;
    /**
     * Renders the default renderable.
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    renderDefaultAsync(fCallback: ErrorCallback): void;
    /**
     * @param {string} [pRenderableHash] - The hash of the renderable to render.
     * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
     */
    basicRender(pRenderableHash?: string, pRenderDestinationAddress?: string, pTemplateRecordAddress?: string | object): boolean;
    /**
     * @param {any} pScope - The scope to use for the template rendering.
     * @param {string} [pRenderableHash] - The hash of the renderable to render.
     * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
     */
    basicRenderWithScope(pScope: any, pRenderableHash?: string, pRenderDestinationAddress?: string, pTemplateRecordAddress?: string | object): boolean;
    /**
     * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
     * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
     * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
     */
    basicRenderAsync(pRenderableHash?: string | ErrorCallback, pRenderDestinationAddress?: string | ErrorCallback, pTemplateRecordAddress?: string | any | ErrorCallback, fCallback?: ErrorCallback): void;
    /**
     * @param {any} pScope - The scope to use for the template rendering.
     * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
     * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
     * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
     * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
     */
    basicRenderWithScopeAsync(pScope: any, pRenderableHash?: string | ErrorCallback, pRenderDestinationAddress?: string | ErrorCallback, pTemplateRecordAddress?: string | any | ErrorCallback, fCallback?: ErrorCallback): void;
    /**
     * @param {Renderable} pRenderable - The renderable that was rendered.
     */
    onProject(pRenderable: Renderable): void;
    /**
     * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
     *
     * @param {(error?: Error, content?: string) => void} fCallback - The callback to call when the async operation is complete.
     * @param {Renderable} pRenderable - The renderable that is being projected.
     */
    onProjectAsync(fCallback: (error?: Error, content?: string) => void, pRenderable: Renderable): void;
    /**
     * Lifecycle hook that triggers after the view is rendered.
     *
     * @param {Renderable} pRenderable - The renderable that was rendered.
     */
    onAfterRender(pRenderable: Renderable): boolean;
    /**
     * Lifecycle hook that triggers after the view is rendered (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     * @param {Renderable} pRenderable - The renderable that was rendered.
     */
    onAfterRenderAsync(fCallback: ErrorCallback, pRenderable: Renderable): any;
    /**
     * Lifecycle hook that triggers after the view is projected into the DOM.
     *
     * @param {Renderable} pRenderable - The renderable that was projected.
     */
    onAfterProject(pRenderable: Renderable): boolean;
    /**
     * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     * @param {Renderable} pRenderable - The renderable that was projected.
     */
    onAfterProjectAsync(fCallback: ErrorCallback, pRenderable: Renderable): void;
    /**
     * Lifecycle hook that triggers before the view is solved.
     */
    onBeforeSolve(): boolean;
    /**
     * Lifecycle hook that triggers before the view is solved (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onBeforeSolveAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers when the view is solved.
     */
    onSolve(): boolean;
    /**
     * Lifecycle hook that triggers when the view is solved (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onSolveAsync(fCallback: ErrorCallback): void;
    /**
     * Performs view solving and triggers lifecycle hooks.
     *
     * @return {boolean} - True if the view was solved successfully, false otherwise.
     */
    solve(): boolean;
    /**
     * Performs view solving and triggers lifecycle hooks (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    solveAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers after the view is solved.
     */
    onAfterSolve(): boolean;
    /**
     * Lifecycle hook that triggers after the view is solved (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onAfterSolveAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers before data is marshaled from the view.
     *
     * @return {boolean} - True if the operation was successful, false otherwise.
     */
    onBeforeMarshalFromView(): boolean;
    /**
     * Lifecycle hook that triggers before data is marshaled from the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onBeforeMarshalFromViewAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers when data is marshaled from the view.
     */
    onMarshalFromView(): boolean;
    /**
     * Lifecycle hook that triggers when data is marshaled from the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onMarshalFromViewAsync(fCallback: ErrorCallback): void;
    /**
     * Marshals data from the view.
     *
     * @return {boolean} - True if the operation was successful, false otherwise.
     */
    marshalFromView(): boolean;
    /**
     * Marshals data from the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    marshalFromViewAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers after data is marshaled from the view.
     */
    onAfterMarshalFromView(): boolean;
    /**
     * Lifecycle hook that triggers after data is marshaled from the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onAfterMarshalFromViewAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers before data is marshaled into the view.
     */
    onBeforeMarshalToView(): boolean;
    /**
     * Lifecycle hook that triggers before data is marshaled into the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onBeforeMarshalToViewAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers when data is marshaled into the view.
     */
    onMarshalToView(): boolean;
    /**
     * Lifecycle hook that triggers when data is marshaled into the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onMarshalToViewAsync(fCallback: ErrorCallback): void;
    /**
     * Marshals data into the view.
     *
     * @return {boolean} - True if the operation was successful, false otherwise.
     */
    marshalToView(): boolean;
    /**
     * Marshals data into the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    marshalToViewAsync(fCallback: ErrorCallback): void;
    /**
     * Lifecycle hook that triggers after data is marshaled into the view.
     */
    onAfterMarshalToView(): boolean;
    /**
     * Lifecycle hook that triggers after data is marshaled into the view (async flow).
     *
     * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
     */
    onAfterMarshalToViewAsync(fCallback: ErrorCallback): void;
    /** @return {boolean} - True if the object is a PictView. */
    get isPictView(): boolean;
}
declare namespace PictView {
    export { ErrorCallback, PictTimestamp, RenderMethod, Renderable };
}
type ErrorCallback = (error?: Error) => void;
type PictTimestamp = number | boolean;
type RenderMethod = "replace" | "append" | "prepend" | "append_once" | "virtual-assignment";
type Renderable = {
    /**
     * - A unique hash for the renderable.
     */
    RenderableHash: string;
    /**
     * - The hash of the template to use for rendering this renderable.
     */
    TemplateHash: string;
    /**
     * - The default address for resolving the data record for this renderable.
     */
    DefaultTemplateRecordAddress?: string;
    /**
     * - The default address (DOM CSS selector) for rendering the content of this renderable.
     */
    ContentDestinationAddress?: string;
    /**
     * - The method to use when projecting the renderable to the DOM ('replace', 'append', 'prepend', 'append_once', 'virtual-assignment').
     */
    RenderMethod?: RenderMethod;
    /**
     * - The address to use for testing the renderable.
     */
    TestAddress?: string;
    /**
     * - The transaction hash for the root renderable.
     */
    TransactionHash?: string;
    /**
     * - The hash of the root renderable.
     */
    RootRenderableViewHash?: string;
    /**
     * - The rendered content for this renderable, if applicable.
     */
    Content?: string;
};
//# sourceMappingURL=Pict-View.d.ts.map