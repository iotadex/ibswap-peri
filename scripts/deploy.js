// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const WSMR = await hre.ethers.getContractFactory("WSMR");
    const wsmr = await WSMR.deploy();
    console.log(`Deployed WSMR to ${wsmr.address}`);

    const NFTDescriptorLib = await hre.ethers.getContractFactory("NFTDescriptor");
    const nftdLib =  await NFTDescriptorLib.deploy();
    console.log(`Deployed NFTDescriptor to ${nftdLib.address}`);

    // SMR => bytes32
    const nativeCurrencyLabelBytes = "0x534d520000000000000000000000000000000000000000000000000000000000";
    const NonfungibleTokenPositionDescriptor = await hre.ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
        libraries:{
            NFTDescriptor: nftdLib.address
        }
    });
    const nftPD = await NonfungibleTokenPositionDescriptor.deploy(wsmr.address, nativeCurrencyLabelBytes);
    console.log(`Deployed NonfungibleTokenPositionDescriptor to ${nftPD.address}`);

    const factory = "0x8AfDFfe813826e63AE96A55C86Fd4a48028F3d1a";
    const NonfungiblePositionManager = await hre.ethers.getContractFactory("NonfungiblePositionManager");
    const nftpm = await NonfungiblePositionManager.deploy(factory, wsmr.address, nftPD.address)
    console.log(`Deployed NonfungiblePositionManager to ${nftpm.address}`);

    const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");
    const router = await SwapRouter.deploy(factory, wsmr.address);
    console.log(`Deployed SwapRouter to ${router.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
