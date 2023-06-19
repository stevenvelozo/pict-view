---
id: xd4l5k7y
title: Pict View Renderables
file_version: 1.1.2
app_version: 1.10.2
---

Pict Views are a collection one or many of renderable(s). Each renderable is one or more template(s), with a single destination address.

Renderables are defined by the view configuration, and have four parameters. An example from our Historical Events app:

<br/>

Historical Events Example App - Category List Renderable
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 example_applications/historic_events_example/views/PictView-HistoricalEvents-Categories.js
```javascript
51     		{
52     			RenderableHash: "HistoricalEventCategory-List",
53     			TemplateHash: "HistoricalEventCategory-ListWrapper",
54     			TemplateRecordAddress: 'AppData.EventCategoryList',
55     			DestinationAddress: "#HistoricalEvents-AppContainer",
56     			RenderMethod: "replace"
57     		}
```

<br/>

## Renderable Hash

You can see that the renderable has been given a RenderableHash. This is the distinct identifier for this renderable in the view. As well, there is a template hash which defines which template is rendered. The hash allows a developer to ask the view to be rendered just by hash, and pict will do its best to follow the configuration passed in.

For 99% of view use cases, this is enough to pull data from the pict AppData and present it to the user in some fashion.

## Template Hash

For almost all views, renderables will only reference templates within themselves. In advanced situations they can also reference templates from other views that are registered with pict (or even templates which are manually registered with pict).

## Template Record Address

When this is set for a renderable, pict will pull data from this location. when rendering the template.

## Destination Address

Since pict is at the core a simple content marshaling system, it needs a location to place rendered content. This is the address (usually in a browser) where the content should be put. Most often this is a DOM selector.

Render Method

When placing content at the destination address, pict needs to know how to behave. The most common render method is to replace content outright. Consider a breadcrumb for your app, or a user status icon. We want to overwrite whatever content is in there with the new.

Sometimes, however, we want to append content to the container. For example a rolling log of events, a huge list of records where we don't want the user to wait for everything to load before displaying or even an AI story, progressively generated paragraph-by-paragraph.

The render method options are:

<br/>

|Method      |Description                                                                                                                                                                                                                                                                                                                     |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|replace     |Replace the content at the destination address outright. Overwriting what was there before.                                                                                                                                                                                                                                     |
|append      |Append the content under all other content at the destination address.                                                                                                                                                                                                                                                          |
|prepend     |Prepend the content before all other content at the destination address                                                                                                                                                                                                                                                         |
|append\_once|Only append the content once to the destination address. This is useful when you have a view that loads at initialization and we want to ensure it doesn't load multiple times (like a login screen). This method expects there to be a unique ID matching the Renderable ID to look for. Otherwise it just behaves like append.|

<br/>

Adding Renderables to a View

The most basic way to add renderables to a view is by defining it in the array of renderables in the configuration loaded during view init. For our Historical Events Example, this configuration is loaded in the App automatically from the default renderables for our view:

<br/>

The Renderable configuration(s) for our basic app's category view:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 example_applications/historic_events_example/views/PictView-HistoricalEvents-Categories.js
```javascript
50     	Renderables: [
51     		{
52     			RenderableHash: "HistoricalEventCategory-List",
53     			TemplateHash: "HistoricalEventCategory-ListWrapper",
54     			TemplateRecordAddress: 'AppData.EventCategoryList',
55     			DestinationAddress: "#HistoricalEvents-AppContainer",
56     			RenderMethod: "replace"
57     		}
58     	]
```

<br/>

When the view is initialized, these are added automatically.

Views also expose a method with the signature `addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateDataAddress, pDefaultDestinationAddress, pRenderMethod)` to add renderables manaully. If you pass in a renderable object instead as the first parameter, it will use the object instead.

```
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBcGljdC12aWV3JTNBJTNBc3RldmVudmVsb3pv/docs/xd4l5k7y).
