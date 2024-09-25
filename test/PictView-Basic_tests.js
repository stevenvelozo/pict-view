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

suite
(
	'Pict View Basic Tests',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Basic Tests',
				() =>
				{
					test(
							'Add a view that does nothing',
							(fDone) =>
							{
								let _Pict = new libPict();
								let _PictEnvironment = new libPict.EnvironmentLog(_Pict);
								let _PictView = _Pict.addView('Pict-View-Test', {}, libPictView);
								Expect(_PictView).to.be.an('object');

								// Test package anthropology
								Expect(_PictView._PackageFableServiceProvider).to.be.an('object', 'Fable should have a _PackageFableServiceProvider object.');
								Expect(_PictView._PackageFableServiceProvider.name).equal('fable-serviceproviderbase', 'Fable _PackageFableServiceProvider.package.name should be set.');
								Expect(_PictView._Package).to.be.an('object', 'Should have a _Package object.');
								Expect(_PictView._Package.name).to.equal('pict-view', '_Package.package.name should be set.');

								return fDone();
							}
						);
				}
			);
	}
);