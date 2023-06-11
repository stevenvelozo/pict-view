/*
	Unit tests for Pict View
*/

// This is temporary, but enables unit tests
const libBrowserEnv = require('browser-env')
libBrowserEnv();

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libPictView = require(`../source/Pict-View.js`);

const dataHistoricEvents = require(`../example_applications/historic_events_example/data/EnglishHistoricEvents-Data.json`);
const viewHistoricEventsCategories = require(`../example_applications/historic_events_example/views/PictView-HistoricalEvents-Categories.js`);

suite
(
	'Pict View Content Render Tests',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Content Render Tests',
				() =>
				{
					test(
							'Render the list of book categories.',
							(fDone) =>
							{
								let _Pict = new libPict();
								// Setup the environment to be log only (no browser or such)
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);

								// The example view provides a static marshal function to make our data work in test harnesses
								viewHistoricEventsCategories.marshal_JSONData_Into_Object(dataHistoricEvents, _Pict.AppData);

								// Initialize the view
								let _PictView = _Pict.addView('HistoricEventsCategories', {}, viewHistoricEventsCategories);

								// Render it manually
								_PictView.render();

								Expect(_PictView).to.be.an('object');
								console.log(JSON.stringify(_PictEnvironment.eventLog.Assign[0].Content));
								return fDone();
							}
						);
				}
			);
	}
);