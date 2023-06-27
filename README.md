# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

token0 : 0x8CB067473a564F2e72cBcd21d2e2d01CfcB4D222              6
token1 : 0x8eC49C6bf03BF0b08B5763529217A28C031ABe01              8

Deployed UniswapV3Factory to 0x3cae2225CEDF6f005d0FEF7FBCfF1538073C653a
UniswapV3Pool init code hash is 0xd0aea3694b6899e0659f9ac990b71639615601444c2dd3e05521451de0f7ecfe
Deployed WSMR to 0x8202AC9838d3F199D3BaD2336e05e52507146659
Deployed NFTDescriptor to 0x6E20F1155B41c13023894Fc00cE403ad951dE346
Deployed NonfungibleTokenPositionDescriptor to 0x2A631305Bae98aD356F74cC75772663fAB5a9ff7
Deployed NonfungiblePositionManager to 0xdE6dE59e33f61eB6B9F4f183323Cf505375906D6
Deployed SwapRouter to 0xB7659A2670378C5d0d32F4ea8C4181FaFBAf6a7C
Deployed TickLens to 0x389d849f2B5F6201Ccd955BCb0F1648f7aB30eCb
Deployed Quoter to 0xDBefB94338fA52F2d8B649aDe806C61B3B1287e7

swap:
token1=0xc9f3a2C8a5C05FDbE086549de9DD9954ACA7BD22&token2=0xdcC4E969F081C3E967581Aa9175EF6F0a337Ae88&fee=10000
gas = 0.089131

添加流动性：
tokenid=10&pool=0x99381366B094Cb94e88423A5cF604CFe536793dA
gas = 0.132916 （已编辑） 

移除流动性：
tokenid=10&pool=0x99381366B094Cb94e88423A5cF604CFe536793dA
gas = 0.111497

mint:
token1=0x3cf63eb3afe4b4717e78eae99d632321fc5ce519&token2=0xe2aC8A14901B17b5cDf7c15F414127d9bcC57A73&fee=10000
gas=0.323469

创建池子gas好高: 4.588051
