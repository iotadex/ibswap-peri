// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const WSMR = await hre.ethers.getContractFactory("WSMR");
    const wsmr0 = await WSMR.deploy();
    console.log(`Deployed WSMR to ${wsmr0.address}`);
    let wsmr = wsmr0.address;
    //    wsmr = "0x1b10CAdebbf96BC2AaA3AFfd78414AB50eCeF571";

    const NFTDescriptorLib = await hre.ethers.getContractFactory("NFTDescriptor");
    const nftdLib = await NFTDescriptorLib.deploy();
    console.log(`Deployed NFTDescriptor to ${nftdLib.address}`);

    // SMR => bytes32
    const nativeCurrencyLabelBytes = "0x534d520000000000000000000000000000000000000000000000000000000000";
    const NonfungibleTokenPositionDescriptor = await hre.ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
        libraries: {
            NFTDescriptor: nftdLib.address
        }
    });
    const nftPD = await NonfungibleTokenPositionDescriptor.deploy(wsmr, nativeCurrencyLabelBytes);
    console.log(`Deployed NonfungibleTokenPositionDescriptor to ${nftPD.address}`);

    const factory = "0x0be5c32E08B6d26Cbf399604A1ECbd78217A0080";
    const NonfungiblePositionManager = await hre.ethers.getContractFactory("NonfungiblePositionManager");
    const nftpm = await NonfungiblePositionManager.deploy(factory, wsmr, nftPD.address)
    console.log(`Deployed NonfungiblePositionManager to ${nftpm.address}`);

    const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");
    const router = await SwapRouter.deploy(factory, wsmr);
    console.log(`Deployed SwapRouter to ${router.address}`);

    const TickLens = await hre.ethers.getContractFactory("TickLens");
    const tickLens = await TickLens.deploy()
    console.log(`Deployed TickLens to ${tickLens.address}`);

    const Quoter = await hre.ethers.getContractFactory("Quoter");
    const quoter = await Quoter.deploy(factory, wsmr);
    console.log(`Deployed Quoter to ${quoter.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
