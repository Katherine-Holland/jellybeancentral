const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

// Utils
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // Ether token deposit address
const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}
const tokens = (n) => ether(n)

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


module.exports = async function(callback) {
try {
const accounts = await web3.eth.getAccounts()

const token = await Token.deployed()
console.log('Token fetched', token.address)

const exchange = await Exchange.deployed()
console.log('Exchanged fetched', exchange.address)

const sender = accounts[0]
const receiver = accounts[1]
let amount = web3.utils.toWei('10000', 'ether')

await token.transfer(receiver, amount, { from: sender })
console.log('Transfered ${amount} tokens from ${sender} to ${receiver}')

const user1 = accounts[0]
const user2 = accounts[1]

amount = 1
await exchange.depositEther({ from: user1, value: ether(amount) })
console.log('Deposited ${amount} Ether from ${user1}')

amount = 10000
await token.approve(exchange.address, tokens(amount), { from: user2 })
console.log('Approved ${amount} tokens from ${user2}')

await exchange.depositToken(token.address, tokens(amount), { from: user2 })
console.log('Deposited ${amount} tokens from ${user2}')

//seed a cancelled order
//
let result 
let orderId
result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1 })
console.log('Made order from ${user1}')

//user1 cancels order
orderId = result.logs[0].args.id
await exchange.cancelOrder(orderId, { from: user1 })
console.log('Cancelled order from ${user1}')

//seed filled orders

//user 1 makes order
result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1 })
console.log('Made order from ${user1}')

//user2 fills order
orderId = result.logs[0].args.id
await exchange.fillOrder(orderId, { from: user2 })
console.log('Filled order from ${user1}')

//wait 1 second
await wait(1)

//user 1 makes another order
result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), {from: user1 })
console.log('Made order from ${user1}')

//user 2 fills another order
orderId = result.logs[0].args.id
await exchange.fillOrder(orderId, { from: user2 })
console.log('Filled order from ${user1}')

//wait 1 sec
await wait(1)

//user1 makes final order
result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), {from: user1 })
console.log('Made order from ${user1}')

//user2 fills final order
orderId = result.logs[0].args.id
await exchange.fillOrder(orderId, { from: user2 })
console.log('Filled order from ${user1}')

//Wait one sec
await wait(1)

//Seed open orders

//user1  makes 10 orders
for (let i = 1; i <= 10; i++) {
	result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, ether(0.01), { from: user1 })
	console.log('Made order from ${user1}')
	//wait 1 sec
	await wait(1)
}
//user2 makes 10 orders
for (let i = 1; i <= 10; i++) {
	result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), { from: user2 })
	console.log('Made order from ${user2}')
//wait 1 sec
await wait(1)
}

}


catch(error) {
	console.log(error)
}


	callback()


}


