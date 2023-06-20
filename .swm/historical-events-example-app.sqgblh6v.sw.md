---
id: sqgblh6v
title: Historical Events Example App
file_version: 1.1.2
app_version: 1.10.2
---

One of our basic example applications is a simple set of views built around a tabular data set of Historical Events.

The data is from a really cool data set of historic events scraped from wikipedia by Dr. Daniel Hienert at the GESIS - Leibniz Institute for the Social Sciences. He has a [web site](https://www.vizgr.org/) where you can view his research and data. We make no claims on the validity of this data but it is awesome to use for test examples. **Thank you Dr. Daniel!** _(note the source data has been lightly transmogrified to be a JSON array)_

## Historical Event "Categories"

Each redord in the data set has zero, one or two categories. These categories are a little messy; there are two strings (category1 and category2) which define a sort of loose taxonomy for the events. For example:

```json
{
    "date": "1158/11/29",
    "description": "Spain: Raymundo, abbot of the Fitero Abbey (Navarra), pledges to defend the fortress of Calatrava from incoming Muslim raiders. It is the founding moment of the Order of Calatrava, the spearhead of the Iberian armies during the Reconquista.ampref name=estow1982amp{{cite journal|last=Estow|first=Clara|title=The Economic Development of the Order of Calatrava, 1158-1366|journal=Speculum|year=1982|volume=57|issue=2|pages=267–291}}ampamp",
    "lang": "en",
    "category1": "By place",
    "category2": "Europe",
    "granularity": "year"
},
{
    "date": "1158/11/29",
    "description": "British Pound Sterling (currency) is introduced.",
    "lang": "en",
    "category1": "By topic",
    "category2": "Economy",
    "granularity": "year"
},
```

These inconsistencies with the records are a common type of problem in getting data:

*   Not all records have a category2

*   The category1 and category2 properties don't appear to be categorically different (in that sometimes category1 is "Economy", and sometimes category2 is "Economy")

*   Some dates are uncertain but instead of using lossier dates (YYYY/MM or YYYY) they choose an approximate date and use one of the "category" labels to say it's date unknown

*   Sometimes one category modifies the other (such as the "By Place" and "Europe" above which interact)

## Okay this is Boring...

So we want to present our users with a screen with a list of the distinct categories. These categories can then be clicked on to see the specific data that lies in that category.

The steps to do this are:

1.  Load up the Database of HISTORY

2.  Cull the list of distinct Categories from the Database

3.  Display the list of Categories to our User

How would I use a PICT View to do this? Easy! We would create a simple custom view. Spoiler below:

<br/>

A complete view for categories.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 example_applications/historic_events_example/views/PictView-HistoricalEvents-Categories.js
<!-- collapsed -->

```javascript
1      const libPictView = require('../../../source/Pict-View.js');
2      
3      const defaultViewConfiguration = (
4      {
5      	// The View identifier is visible in log entries.
6      	// This is useful for when you have multiple views and are debugging.
7      	// This does not intersect with any behaviors at all
8      	ViewIdentifier: "HistoricalEvents-Categories",
9      
10     	// The default Renderable to render if none is specified (or it's run on init)
11     	DefaultRenderable: 'HistoricalEventCategory-List',
12     	// The address (usually an ID of an element in the browser DOM) to render to by default
13     	DefaultDestinationAddress: "#HistoricalEvents-AppContainer",
14     	// The address of data (e.g. "AppData.EventCategoryList") to pass in as the Record for the template
15     	DefaultTemplateRecordAddress: 'AppData.EventCategoryList',
16     
17     	// If this is set to true, the PictApplication will render this to the default destination when it is fully initialized and loaded
18     	RenderOnLoad: true,
19     
20     	Templates: [
21     		{
22     			Hash: "HistoricalEventCategory-ListWrapper",
23     			Template: /*html*/`
24     	<div id="HistoricalEventCategoryListWrapper" class="HistoricalEventCategoryList">
25     		<h2>Historical Event Categories</h2>
26     		<h3>(there are {~Data:Record.length~} categories)</h3>
27     		<table>
28     			<tr>
29     				<th align="center">Category</th>
30     				<th align="center">Count</th>
31     				<th align="center">Earliest</th>
32     				<th align="center">Latest</th>
33     			</tr>
34     
35     			<tbody id="HistoricalEventCategoryListEntries">{~TS:HistoricalEventCategory-Row:AppData.EventCategoryList~}</tbody>
36     		</table>
37     	</div>`
38     		},
39     		{
40     			Hash: "HistoricalEventCategory-Row",
41     			Template: /*html*/`
42     <tr>
43     	<td>{~Data:Record.Name~}</td>
44     	<td>{~Digits:Record.Count~}</td>
45     	<td>{~Data:Record.EventEarliestDate~}</td>
46     	<td>{~Data:Record.EventLatestDate~}</td>
47     </tr>`
48     		}
49     	],
50     	Renderables: [
51     		{
52     			RenderableHash: "HistoricalEventCategory-List",
53     			TemplateHash: "HistoricalEventCategory-ListWrapper",
54     			TemplateRecordAddress: 'AppData.EventCategoryList',
55     			DestinationAddress: "#HistoricalEvents-AppContainer",
56     			RenderMethod: "replace"
57     		}
58     	]
59     });
60     
61     // This is a configuration-only view; this code is here to aid in tweaking stuff for live testing
62     class HistoricalEventsView extends libPictView
63     {
64     	constructor(pFable, pOptions, pServiceHash)
65     	{
66     		super(pFable, pOptions, pServiceHash);
67     	}
68     }
69     
70     module.exports = HistoricalEventsView;
71     
72     module.exports.default_configuration = defaultViewConfiguration;
```

<br/>

A function that enumerates the category list and calculates basic statistics.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 example_applications/historic_events_example/views/PictView-HistoricalEvents-Categories.js
<!-- collapsed -->

```javascript
74     // NOTE: THIS STATIC FUNCTION IS NOT SUGGESTED BEST PRACTICE; IT IS HERE FOR TEST HARNESSES
75     module.exports.marshal_JSONData_Into_Object = (pDataHistoricEventSet, pDestinationObject) =>
76     {
77     	// We are doing this here so we can test the view without the App, which would do this.
78     	// Data looks like:
79     	/*
80     ...
81         {
82             "date": "1953/08/19",
83             "description": "The United States returns to West Germany 382 ships it had captured during World War II.",
84             "lang": "en",
85             "category1": "August",
86             "granularity": "year"
87         },
88         {
89             "date": "1953/08/25",
90             "description": "The general strike ends in France.",
91             "lang": "en",
92             "category1": "August",
93             "granularity": "year"
94         },
95     ... 
96     	*/
97     	// Parse the data and create an array of event categories with some basic statistics
98     	pDestinationObject.EventCategoryList = [];
99     	pDestinationObject.EventCategoryMap = {};
100    	for (let i = 0; i < pDataHistoricEventSet.length; i++)
101    	{
102    		// Each event has a category1 and category2 label
103    		if (!pDestinationObject.EventCategoryMap.hasOwnProperty(pDataHistoricEventSet[i].category1))
104    		{
105    			pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1] = (
106    				{
107    					Name: pDataHistoricEventSet[i].category1,
108    					Count: 0,
109    					EventEarliestDate: pDataHistoricEventSet[i].date,
110    					EventEarliestDescription: pDataHistoricEventSet[i].description
111    				});
112    			pDestinationObject.EventCategoryList.push(pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1]);
113    		}
114    		// Increment the count so we have fun data to display.
115    		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].Count++;
116    		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].EventLatestDate = pDataHistoricEventSet[i].date;
117    		pDestinationObject.EventCategoryMap[pDataHistoricEventSet[i].category1].EventLatestDescription = pDataHistoricEventSet[i].description;
118    	}
119    };
120    
```

<br/>

Usually you would have a database or API or file or something to provide the statistics. It is to provide easy test harnesses (and working examples) that the above function exists in this codebase at all.

Step 3 in our project plan is all configuration. There are a couple templates and an address for where to look for records. Our templates don't even require that configuration.

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBcGljdC12aWV3JTNBJTNBc3RldmVudmVsb3pv/docs/sqgblh6v).
