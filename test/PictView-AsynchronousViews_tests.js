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

const SimpleAsyncView = require(`../example_applications/simple/PictView-Simple-AsyncExercises.js`);

suite
	(
		'Pict View Async View Tests',
		() =>
		{
			setup(() => { });

			suite
				(
					'Making a view with an asynchronous initializer...',
					() =>
					{
						test(
							'Add a simple async view',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let _PictView = _Pict.addView(`View-Test-Async`, false, SimpleAsyncView);

								_PictView.initializeAsync(
									(pError) =>
									{
										Expect(_PictView).to.be.an('object');
										return fDone();
									});
							}
						);
						test(
							'Exercise onBeforeRenderAsync and onAfterRenderAsync',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let _PictView = _Pict.addView(`View-Test-Async`, SimpleAsyncView.defaultViewConfiguration, SimpleAsyncView);

								let tmpBeforeValue = false;
								let tmpAfterValue = false;

								_PictView.onBeforeRenderAsync = (fCallback) =>
								{
									tmpBeforeValue = true;
									return fCallback();
								};

								_PictView.onAfterRenderAsync = (fCallback) =>
								{
									tmpAfterValue = true;
									return fCallback();
								}

								let tmpAnticipate = _Pict.newAnticipate();

								tmpAnticipate.anticipate(_PictView.initializeAsync.bind(_PictView));
								tmpAnticipate.anticipate(
									(fCallback) =>
									{
										_PictView.renderAsync(false, false, false, fCallback);
									}
								);

								tmpAnticipate.wait(
									(pError) =>
									{
										Expect(tmpBeforeValue).to.be.true;
										Expect(tmpAfterValue).to.be.true;
										return fDone();
									});

							}
						);
						test(
							'Add a simple async view and try to initialize twice',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let _PictView = _Pict.addView('SimpleAsyncView', false, SimpleAsyncView);

								_PictView.initializeAsync(
									(pError) =>
									{
										_PictView.initializeAsync(
											(pError) =>
											{
												Expect(_PictView).to.be.an('object');
												return fDone();
											});
									});
							}
						);
						test(
							'Add a ... FEW (3) of simple async views with gory logging',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogNoisiness = 5;
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let tmpAnticipate = _Pict.instantiateServiceProviderWithoutRegistration('Anticipate');
								tmpAnticipate.maxOperations = 3;
								for (let i = 0; i < 3; i++)
								{
									let tmpPictViewAsync = _Pict.addView(`View-${i}`, false, SimpleAsyncView);
									tmpAnticipate.anticipate(tmpPictViewAsync.initializeAsync.bind(tmpPictViewAsync))
								}
								tmpAnticipate.wait(
									(pError) =>
									{
										fDone();
									});
							}
						);
						test(
							'Add a ... MANY (10) of simple async views with minimal logging',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogNoisiness = 1;
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let tmpAnticipate = _Pict.instantiateServiceProviderWithoutRegistration('Anticipate');
								tmpAnticipate.maxOperations = 10;
								for (let i = 0; i < 10; i++)
								{
									let tmpPictViewAsync = _Pict.addView(`View-${i}`, false, SimpleAsyncView);
									tmpAnticipate.anticipate(tmpPictViewAsync.initializeAsync.bind(tmpPictViewAsync))
								}
								tmpAnticipate.wait(
									(pError) =>
									{
										fDone();
									});
							}
						);
						test(
							'Add a ... LOT (10000) of simple async views with no logging',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogNoisiness = 0;
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let tmpAnticipate = _Pict.instantiateServiceProviderWithoutRegistration('Anticipate');
								tmpAnticipate.maxOperations = 5000;
								for (let i = 0; i < 10000; i++)
								{
									let tmpPictViewAsync = _Pict.addView(`View-${i}`, false, SimpleAsyncView);
									tmpAnticipate.anticipate(tmpPictViewAsync.initializeAsync.bind(tmpPictViewAsync))
								}
								tmpAnticipate.wait(
									(pError) =>
									{
										fDone();
									});
							}
						);
					}
				);
		}
	);