const libPictView = require('../../source/Pict-View.js');

class SimpleSolverView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeSolve()
	{
		super.onBeforeSolve();
		if (!this.pict.AppData.hasOwnProperty('ViewCount'))
		{
			this.pict.AppData.ViewCount = 0;
		}
	}

	onSolve()
	{
		super.onSolve();
		this.pict.AppData.ViewCount++;
	}

	onAfterSolve()
	{
		this.pict.log.info(`ViewCount: ${this.pict.AppData.ViewCount}`);
	}
}

module.exports = SimpleSolverView;