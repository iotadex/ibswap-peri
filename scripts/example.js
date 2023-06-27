$.NewUniswapV3 = function (e) {
    e = e || exchange                          // 如果没有传参数e，就使用交易所对象exchange，即策略上第一个添加的交易所
    if (e.GetName() !== 'Web3') {              // 判断交易所对象是否是Web3，因为这个模板只支持Web3交易所对象
        panic("only support Web3 exchange")
    }


    let self = {                               // 当前函数是一个构造函数，构造的对象就是self这个对象
        tokenInfo: {},                         // self对象的成员变量，用于记录token的注册信息
        walletAddress: e.IO("address"),        // 记录当前交易所对象绑定的钱包地址
        pool: {}                               // 用于记录注册的池信息
    }

    // register
    e.IO("abi", ContractV3Factory, ABI_Factory)       // 注册工厂合约的ABI
    e.IO("abi", ContractV3SwapRouterV2, ABI_Route)    // 注册路由合约的ABI

    self.addToken = function (name, address) {         // 用于注册token
        let ret = e.IO("api", address, "decimals")    // 调用decimals方法，获取token精度信息
        if (!ret) {
            throw "get token decimals failed"
        }
        let decimals = Number(ret)
        self.tokenInfo[name] = {
            name: name,
            decimals: decimals,
            address: address
        }
    }
    self.waitMined = function (tx) {             // 用于等待以太坊上某个操作的结果，哈希为tx参数
        while (true) {
            Sleep(1000)
            let info = e.IO("api", "eth", "eth_getTransactionReceipt", tx)  // 查询结果使用eth_getTransactionReceipt方法，没有查询到，循环继续查询
            if (info && info.gasUsed) {
                return true
            }
            Log('Transaction not yet mined', tx)
        }
    }

    self.swapToken = function (tokenIn, amountInDecimal, tokenOut, options) {   // 用于token兑换
        // options like {gasPrice: 11, gasLimit: 111, nonce: 111}
        let tokenInInfo = self.tokenInfo[tokenIn]      // 拿到兑换出去的token的信息
        let tokenOutInfo = self.tokenInfo[tokenOut]    // 拿到兑换回来的token的信息
        if (!tokenInInfo) {
            throw "not found token info " + tokenIn
        }

        if (!tokenOutInfo) {
            throw "not found token info " + tokenOut
        }

        let amountIn = toInnerAmount(amountInDecimal, tokenInInfo.decimals)  // 转换为智能合约上使用的数据
        let recipientAddress = self.walletAddress
        if (tokenInInfo.name != 'ETH') {
            let allowanceAmount = e.IO("api", tokenInInfo.address, "allowance", self.walletAddress, ContractV3SwapRouterV2);   // 查询授权的数量
            let realAmount = toAmount(allowanceAmount, tokenInInfo.decimals)
            if (realAmount < toAmount(amountIn, tokenInInfo.decimals)) {    // 如果授权数量不足
                Log("realAmount is", realAmount, "too small, try to approve large amount")
                if (tokenInInfo.name == 'USDT') {
                    // As described in Tether code: To change the approve amount you first have to reduce the addresses allowance to 0 calling approve(spender, 0)
                    let txApprove = e.IO("api", tokenInInfo.address, "approve", ContractV3SwapRouterV2, 0)  // 如果授权的token是USDT，需要先授权为0
                    if (!txApprove) {
                        throw "approve error"
                    }
                    Log("wait reduce approve", txApprove)
                    self.waitMined(txApprove)
                }

                let txApprove = e.IO("api", tokenInInfo.address, "approve", ContractV3SwapRouterV2, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');  // 授权Router合约操作钱包的代币
                if (!txApprove) {
                    throw "approve error"
                }
                Log("wait approve", txApprove)
                self.waitMined(txApprove)
                Log("approve success amountIn", amountIn)
            } else {
                Log("allowance", realAmount, "no need to approve")
            }
        }

        if (tokenOutInfo.name == 'ETH' || tokenOutInfo.address.toLowerCase() == '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
            /*
            ADDRESS_THIS https://degencode.substack.com/p/uniswapv3-multicall
            https://etherscan.io/address/0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45#code
            */
            recipientAddress = '0x0000000000000000000000000000000000000002'
            // 其它币换成 WETH的时候，要让合约HOLD住WETH才可以赎回
        }

        let swapToken = e.IO("pack", ContractV3SwapRouterV2, "swapExactTokensForTokens", amountIn, 1, [tokenInInfo.address, tokenOutInfo.address], recipientAddress)   // 打包swapExactTokensForTokens调用
        let data = [swapToken]
        if (tokenOutInfo.name == 'ETH') {    // 如果兑换时，兑换回来的token是ETH，这里实际是WETH，则需要解包
            data.push(e.IO("pack", ContractV3SwapRouterV2, "unwrapWETH9(uint256,address)", 1, self.walletAddress))   // 所以这里再打包一个unwrapWETH9解包调用
        }
        let tx = e.IO("api", ContractV3SwapRouterV2, "multicall(uint256,bytes[])", (tokenInInfo.name == 'ETH' ? amountIn : 0), (new Date().getTime() / 1000) + 3600, data, options || {})   // 使用multicall执行这些打包的操作（swapExactTokensForTokens、unwrapWETH9）
        if (tx) {
            Log("tx: ", tx)
            self.waitMined(tx)
            Log("swap", tokenInInfo.name, "to", tokenOutInfo.name, "success")
            return true
        } else {
            Log("trans error")
            return false
        }
    }

    self.getETHBalance = function (address) {   // 查询钱包的ETH余额
        return toAmount(e.IO("api", "eth", "eth_getBalance", address || self.walletAddress, "latest"), 18)
    }

    self.balanceOf = function (token, address) {  // 查询钱包的某个token余额（根据参数确定）
        let tokenInfo = self.tokenInfo[token]
        if (!tokenInfo) {
            throw "not found token info " + token
        }

        return toAmount(e.IO("api", tokenInfo.address, "balanceOf", address || self.walletAddress), tokenInfo.decimals)
    }

    self.sendETH = function (to, amount, options) {   // 向某个地址发送ETH代币，即转账
        return e.IO("api", "eth", "send", to, toInnerAmount(amount, 18), options || {})
    }

    self.getPrice = function (pair, fee) {     // 获取交易对价格 
        let arr = pair.split('_')
        let token0 = self.tokenInfo[arr[0]]
        if (!token0) {
            throw "token " + arr[0] + "not found"
        }
        let token1 = self.tokenInfo[arr[1]]    // 首先拿到构成交易对的两个token信息
        if (!token1) {
            throw "token " + arr[1] + "not found"
        }
        let reverse = false
        if (BigInt(token0.address) > BigInt(token1.address)) {
            let tmp = token0
            token0 = token1
            token1 = tmp
            reverse = true
        }
        let key = token0.address + '/' + token1.address
        if (typeof (self.pool[key]) == 'undefined') {
            let pool = e.IO("api", ContractV3Factory, "getPool", token0.address, token1.address, typeof (fee) === 'number' ? fee : 3000)   // 调用工厂合约的getPool方法，获取兑换池的地址
            if (pool) {
                self.pool[key] = pool    // 注册池地址，并注册池合约的ABI
                // register pool address
                e.IO("abi", pool, ABI_Pool)
            }
        }
        if (typeof (self.pool[key]) == 'undefined') {
            throw "pool " + pair + " not found"
        }

        let slot0 = e.IO("api", self.pool[key], "slot0")  // 调用池合约的slot0方法，拿到价格相关信息

        if (!slot0) {
            return null
        }

        let price = computePoolPrice(token0.decimals, token1.decimals, slot0.sqrtPriceX96)  // 计算出可读的价格
        if (reverse) {
            price = 1 / price
        }
        return price
    }

    return self
}