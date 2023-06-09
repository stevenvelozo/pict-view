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

const SimpleAsyncView = require(`./views/Simple-Async-View.js`);

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
								let _PictView = _Pict.addView({}, `View-Test-Async`);

								_PictView.initializeAsync(
									(pError) =>
									{
										Expect(_PictView).to.be.an('object');
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
								let _PictView = _Pict.addView({}, 'SimpleAsyncView', SimpleAsyncView);

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
							'Add a ... MANY (10) of simple async views',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let tmpAnticipate = _Pict.serviceManager.instantiateServiceProviderWithoutRegistration('Anticipate');
								tmpAnticipate.maxOperations = 10;
								for (let i = 0; i < 10; i++)
								{
									let tmpPictViewAsync = _Pict.addView({}, `View-${i}`, SimpleAsyncView);
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
							'Add a ... LOT (10000) of simple async views',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let tmpAnticipate = _Pict.serviceManager.instantiateServiceProviderWithoutRegistration('Anticipate');
								tmpAnticipate.maxOperations = 5000;
								for (let i = 0; i < 10000; i++)
								{
									let tmpPictViewAsync = _Pict.addView({}, `View-${i}`, SimpleAsyncView);
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