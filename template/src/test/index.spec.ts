import * as MyMod from '../index'

describe('#my-mod',() => {
	it('#logs',() => {
		//noinspection TypeScriptUnresolvedFunction
		expect(MyMod.myFunc()).to.be.true
	})
})