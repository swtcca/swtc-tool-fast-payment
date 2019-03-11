const ToolSet = require('swtc-toolset')
const toolset = new ToolSet()
const SwtcLib = require('swtc-lib')
toolset.promisifyAll(SwtcLib)
const Remote = SwtcLib.Remote;
const Wallet = SwtcLib.Wallet
const moment = require('moment')
const sleep_promise = time => new Promise(res => setTimeout(() => res(), time))

const fastPayment = async function (from_wallet_or_secret, to_list_of_wallets_or_addresses, default_quantity, currency='swt', default_memo="", server_to_use=toolset.REMOTE.server) {
	let ready_to_send=false, result={}, from_wallet={}, to_wallets=[], not_to_wallets=[], retry_max=2, remote
	try {
		from_wallet = typeof from_wallet_or_secret === 'object' ? from_wallet_or_secret : Wallet.fromSecret(from_wallet_or_secret)
		if ( !Wallet.isValidSecret(from_wallet.secret) ) {
			return Promise.reject('provide a correct wallet or secret to send')
		}
	} catch (error) {
		return Promise.reject('provide a correct wallet or secret to send')
	}
	try {
		default_quantity = Number(default_quantity)
	} catch (error) {
		return Promise.reject('provide a correct default quantity to pay')
	}
	if ( !Array.isArray(to_list_of_wallets_or_addresses) ) {
		return Promise.reject('provided a list of targets to pay to')
		to_list_of_wallets_or_addresses = {address: to_list_of_wallets_or_addresses}
	}
	try {
		to_list_of_wallets_or_addresses.forEach( (element) => {
			element = typeof element === 'object' ? element : { address: element }
			if ( !Wallet.isValidAddress(element.address) ) {
				not_to_wallets.push(element)
			} else {
				element.currency = currency
				if ( !element.hasOwnProperty('quantity') ) {
					element.quantity = default_quantity
				}
				to_wallets.push(element)
			}
		})
		//to_wallets.unshift({address: 'jLvo6LSKNEYJ4KDwDuM8LU5fuSsQkE4HVW', quantity: 0.01, currency: 'swt'});
		result.to_wallets = to_wallets.slice()
		result.not_to_wallets = not_to_wallets
	} catch (error) {
		return Promise.reject(error)
	}
	if ( to_wallets.length === 0 ) {
		return Promise.reject("provide a list of addresses to send to")
	}
	try {
		remote = new Remote({ server: server_to_use, local_sign: true })
		await remote.connectAsync()
		ready_to_send = true
		let account_info = await toolset.requestAccountInfo(remote, from_wallet).submitAsync()
		from_wallet.balance_initial = Number(account_info.account_data.Balance) / 1000000
		from_wallet.sequence = account_info.account_data.Sequence
		from_wallet.ready = true
		result.success_wallets = []
		result.failure_wallets = []
		while (ready_to_send && to_wallets.length > 0) {
			let to_wallet = to_wallets.shift()
			if ( to_wallet.hasOwnProperty('retry') && to_wallet.retry > retry_max ) {
				results.failure_wallets.push(to_wallet)
				continue
			}
			try {
				var tx = toolset.buildPaymentTx(remote, {
						account: from_wallet.address,
						to: to_wallet.address,
						amount: toolset.makeAmount(currency, Number(to_wallet.quantity))
				})
				tx.setSequence(from_wallet.sequence)
				tx.setSecret(from_wallet.secret)
				tx.addMemo(default_memo || `${(new moment()).format('YYYYMMDDHHmmss')}`)
				try {
					if ( ! remote.isConnected() ) {
						await remote.connectAsync()
					}
					while ( ! from_wallet.ready ) {
						await sleep_promise(500)
						console.log("... wallet sequence not ready ...")
					}
					from_wallet.ready = false
					let response = await tx.submitAsync()
					if (response.engine_result === 'tesSUCCESS') {
						from_wallet.sequence += 1
						from_wallet.ready = true 
						result.success_wallets.push(to_wallet)
						console.log(from_wallet);
					} else if (response.engine_result === 'tefPAST_SEQ') {
						to_wallets.push(to_wallet)
						from_wallet.sequence += 1
						from_wallet.ready = true
					} else {
						to_wallet.error = response.engine_result
						result.failure_wallets.push(to_wallet)
						from_wallet.ready = true
					}
				} catch (error) {
					console.log('tarnsaction error occur')
					console.log(error)
					to_wallet.error = error
					from_wallet.ready = true 
					to_wallet.hasOwnProperty('retry') ? to_wallet.retry += 1 : to_wallet.retry = 1
					to_wallets.push(to_wallet);
					await sleep_promise(10)
				}
			} catch (error) {
				return Promise.reject(error)
			}
		}
		account_info = await toolset.requestAccountInfo(remote, from_wallet).submitAsync()
		from_wallet.balance_current = Number(account_info.account_data.Balance) / 1000000
		console.log(from_wallet)
		return Promise.resolve(result)
	} catch (error) {
		return Promise.reject(error)
	}
}


module.exports = fastPayment

