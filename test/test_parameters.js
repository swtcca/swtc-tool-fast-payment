const ToolSet = require('swtc-toolset')
const SwtcLib = require('swtc-lib')
const fastPayment = require('../index')
const expect = require('chai').expect
const toolset = new ToolSet()
toolset.promisifyAll(SwtcLib)
const Wallet = SwtcLib.Wallet

describe('fastPayment parameters', function () {

    describe('valid secret required', function () {
		let wallet = Wallet.generate()
        it('should reject with invalid secret', async function () {
			try {
				await fastPayment(wallet.secret.slice(1),[], 1)
			} catch (error) {
            	expect(error).to.equal('provide a correct wallet or secret to send')
			}
        })
        it('should reject with invalid wallet', async function () {
			try {
				await fastPayment({address: wallet.address, secret: wallet.secret.slice(2)},[], 1)
			} catch (error) {
            	expect(error).to.equal('provide a correct wallet or secret to send')
			}
        })
        it('should reject without default quantity to pay', async function () {
			try {
				await fastPayment(wallet, [])
			} catch (error) {
            	expect(error).to.equal('provide a list of addresses to send to')
			}
        })
        it('should reject with valid inactivated wallet or secret', async function () {
			try {
				let result = await fastPayment(wallet,[wallet], 1)
			} catch (error) {
				expect(error).to.equal('need a valid wallet to send')
			}
        })
    })
})
