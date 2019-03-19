
# 快速转账

## Description
> #### 快速转帐适用于大批量转移支付
> #### 源文件演示swtc-toolset提供的便利性辅助
> #### 充分利用javascript的async/await, 不依赖于帐本的关闭
> #### node.js/web通用


## Getting

```shell
  $ npm install swtc-tool-fast-payment 
```

## Using

```javascript
const fastPayment = require('swtc-tool-fast-payment')
const from_wallet = {secret: 's...........................'}
var to_wallets = [
	{address: 'ja............', quantity: nnn},
	{address: 'jb............', quantity: mmm},
	{address: 'jc............'} // if no quantity specified, use the default quantity in function parameter
]
var default_quantity = 1
const token_to_send = 'swt'
const server_to_use = 'ws://swtclib.daszichan.com:5020'
default_memo = 'memo: '
fastPayment(from_wallet, to_wallets, default_quantity, token_to_send, server_to_use, default_memo)
	.then( (result) => console.log(result) )
	.catch ( (error) => console.log(error) )
```

## Involving

```bash
  $ git clone https://github.com/swtcca/swtc-tool-fast-payment.git
  $ cd swtc-tool-fast-payment; npm install
  $ npm run test
```

## Limits
- 目前仅支持swtc的快速转帐
- 代币支持后续添加

# About Jingtum lib
# Abount Swtc Lib
# About Swtc Toolset
