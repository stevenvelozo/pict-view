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
class SimpleAsyncView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.preInitState = false;
		this.initState = false;
		this.afterInitState = false;
	}

	onBeforeInitializeAsync(fCallback)
	{
		super.onBeforeInitialize();
		let tmpInitTime = this.fable.DataGeneration.randomIntegerBetween(10,150);
		this.preInitState = `${this.Hash} Beginning PRE initialization routine; waiting ${tmpInitTime}ms.`;
		this.log.info(this.preInitState);
		setTimeout(
			()=>
			{
				this.preInitState = `${this.Hash} Preinitialization complete COMPLETED after waiting ${tmpInitTime}ms.`;
				this.log.info(this.preInitState);
				return fCallback();
			}, tmpInitTime);
	}

	onInitializeAsync(fCallback)
	{
		super.onInitialize();
		let tmpInitTime = this.fable.DataGeneration.randomIntegerBetween(10,200);
		this.initState = `${this.Hash} Beginning initialization routine; waiting ${tmpInitTime}ms.`;
		this.log.info(this.initState);
		setTimeout(
			()=>
			{
				this.initState = `${this.Hash} initialize routine COMPLETED after waiting ${tmpInitTime}ms!`;
				this.log.info(this.initState);
				return fCallback();
			}, tmpInitTime);
	}

	onAfterInitializeAsync(fCallback)
	{
		super.onAfterInitialize();
		let tmpInitTime = this.fable.DataGeneration.randomIntegerBetween(10,80);
		this.afterInitState = `${this.Hash} Beginning AFTER initialization routine; waiting ${tmpInitTime}ms.`;
		this.log.info(this.afterInitState);
		setTimeout(
			()=>
			{
				this.afterInitState = `${this.Hash} Afterinitialize routine COMPLETED after waiting ${tmpInitTime}ms!`;
				this.log.info(this.afterInitState);
				return fCallback();
			}, tmpInitTime);
	}
}

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