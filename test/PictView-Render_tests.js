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

								Expect(_PictView.lastMarshalToViewTimestamp).to.equal(false);
								Expect(_PictView.marshalToView()).to.equal(true);
								Expect(_PictView.lastMarshalToViewTimestamp).to.be.a('number');
								Expect(_PictView.solve()).to.equal(true);
								Expect(_PictView.render()).to.equal(true);
								Expect(_PictView.marshalFromView()).to.equal(true);
								return fDone();
							}
						);
					test(
							'Render the list of book categories with control flow logging.',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogControlFlow = true;

								// Setup the environment to be log only (no browser or such)
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);

								// The example view provides a static marshal function to make our data work in test harnesses
								viewHistoricEventsCategories.marshal_JSONData_Into_Object(dataHistoricEvents, _Pict.AppData);

								// Initialize the view
								let _PictView = _Pict.addView('HistoricEventsCategories', {}, viewHistoricEventsCategories);

								_PictView.initialize();

								// Render it manually
								_PictView.render();

								Expect(_PictView).to.be.an('object');
								console.log(JSON.stringify(_PictEnvironment.eventLog.Assign[0].Content));

								Expect(_PictView.lastMarshalToViewTimestamp).to.equal(false);
								Expect(_PictView.marshalToView()).to.equal(true);
								Expect(_PictView.lastMarshalToViewTimestamp).to.be.a('number');
								Expect(_PictView.solve()).to.equal(true);
								Expect(_PictView.render()).to.equal(true);
								Expect(_PictView.marshalFromView()).to.equal(true);
								return fDone();
							}
						);
					test(
							'Render with a passed-in object.',
							(fDone) =>
							{
								let _Pict = new libPict();
								// Setup the environment to be log only (no browser or such)
								let _PictEnvironment = new libPict.EnvironmentObject(_Pict);

								// The example view provides a static marshal function to make our data work in test harnesses
								viewHistoricEventsCategories.marshal_JSONData_Into_Object(dataHistoricEvents, _Pict.AppData);

								// Initialize the view
								let _PictView = _Pict.addView('HistoricEventsCategories', {}, viewHistoricEventsCategories);

								// Render it manually
								_PictView.render('HistoricalEventCategory-Row', 'TestDestination', {Name:'Custom passed-in object'});
								_PictView.render('HistoricalEventMetadata', 'TestMetadataDestination', {Name:'Custom passed-in object'});

								Expect(_PictEnvironment.contentMap.TestDestination).to.equal('\n<tr>\n\t<td>Custom passed-in object</td>\n\t<td>0.00</td>\n\t<td></td>\n\t<td></td>\n</tr>');
								Expect(_PictEnvironment.contentMap.TestMetadataDestination).to.equal('Very Historical categories');
								return fDone();
							}
						);
				}
			);
	}
);