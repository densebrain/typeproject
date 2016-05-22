import * as MyMod from '../index'

describe('#my-mod',() => {
	it('#logs',() => {
		expect(MyMod.myFunc()).to.be.true
	})
})