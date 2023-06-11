const libPictView = require('../../../source/Pict-View.js');

const defaultViewConfiguration = (
{
	// The View identifier is visible in log entries.
	// This is useful for when you have multiple views and are debugging.
	// This does not intersect with any behaviors at all
	ViewIdentifier: "HistoricalEvents-Categories",

	// The default Renderable to render if none is specified (or it's run on init)
	DefaultRenderable: 'HistoricalEventCategory-List',
	// The address (usually an ID of an element in the browser DOM) to render to by default
	DefaultDestinationAddress: "#HistoricalEvents-AppContainer",
	// The address of data (e.g. "AppData.EventCategoryList") to pass in as the Record for the template
	DefaultTemplateRecordAddress: 'AppData.EventCategoryList',

	// If this is set to true, the PictApplication will render this to the default destination when it is fully initialized and loaded
	RenderOnLoad: true,

	Templates: [
		{
			Hash: "HistoricalEventCategory-ListWrapper",
			Template: /*html*/`
	<div id="HistoricalEventCategoryListWrapper" class="HistoricalEventCategoryList">
		<h2>Historical Event Categories</h2>
		<h3>(there are {~Data:Record.length~} categories)</h3>
		<table>
			<tr>
				<th align="center">Category</th>
				<th align="center">Count</th>
				<th align="center">Earliest</th>
				<th align="center">Latest</th>
			</tr>

			<tbody id="HistoricalEventCategoryListEntries">{~TS:HistoricalEventCategory-Row:AppData.EventCategoryList~}</tbody>
		</table>
	</div>`
		},
		{
			Hash: "HistoricalEventCategory-Row",
			Template: /*html*/`
<tr>
	<td>{~Data:Record.Name~}</td>
	<td>{~Digits:Record.Count~}</td>
	<td>{~Data:Record.EventEarliestDate~}</td>
	<td>{~Data:Record.EventLatestDate~}</td>
</tr>`
		}
	],
	Renderables: [
		{
			RenderableHash: "HistoricalEventCategory-List",
			TemplateHash: "HistoricalEventCategory-ListWrapper",
			TemplateRecordAddress: false,
			DestinationAddress: "#HistoricalEvents-AppContainer"
		}
	]
});

// This is a configuration-only view; this code is here to aid in tweaking stuff for live testing
class HistoricalEventsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = HistoricalEventsView;

module.exports.default_configuration = defaultViewConfiguration;

// NOTE: THIS STATIC FUNCTION IS NOT SUGGESTED BEST PRACTICE; IT IS HERE FOR TEST HARNESSES
module.exports.marshal_JSONData_Into_Object = (pDataHistoricEventSet, pDestinationObject) =>
{
	// We are doing this here so we can test the view without the App, which would do this.
	// Data looks like:
	/*
...
    {
        "date": "1953/08/19",
        "description": "The United States returns to West Germany 382 ships it had captured during World War II.",
        "lang": "en",
        "category1": "August",
        "granularity": "year"
    },
    {
        "date": "1953/08/25",
        "description": "The general strike ends in France.",
        "lang": "en",
        "category1": "August",
        "granularity": "year"
    },
... 
	*/
	// Parse the data and create an array of event categories with some basic statistics
	pDestinationObject.EventCategoryList = [];
	pDestinationObject.EventCategoryMap = {};
	for (let i = 0; i < pDataHistoricEventSet.length; i++)
	{
		if (!pDestinationObject.EventCategoryMap.hasOwnProperty(pDataHistoricEventSet[i].category1))
		{
			pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1] = (
				{
					Name: pDataHistoricEventSet[i].category1,
					Count: 0,
					EventEarliestDate: pDataHistoricEventSet[i].date,
					EventEarliestDescription: pDataHistoricEventSet[i].description
				});
			pDestinationObject.EventCategoryList.push(pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1]);
		}
		// Increment the count so we have fun data to display.
		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].Count++;
		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].EventLatestDate = pDataHistoricEventSet[i].date;
		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].EventLatestDescription = pDataHistoricEventSet[i].description;
	}
};
