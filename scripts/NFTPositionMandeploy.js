// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const wsmr = "0x8202AC9838d3F199D3BaD2336e05e52507146659";
    const factory = "0x3cae2225CEDF6f005d0FEF7FBCfF1538073C653a";
    const nftPD = "0x2A631305Bae98aD356F74cC75772663fAB5a9ff7";
    const NonfungiblePositionManager = await hre.ethers.getContractFactory("NonfungiblePositionManager");
    const nftpm = await NonfungiblePositionManager.deploy(factory, wsmr, nftPD)
    console.log(`Deployed NonfungiblePositionManager to ${nftpm.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
