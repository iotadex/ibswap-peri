// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const wsmr = "0xe2aC8A14901B17b5cDf7c15F414127d9bcC57A73";

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

    const factory = "0x6cDa60f2b8C9514985eCE2e645829A602D01BE39";
    const NonfungiblePositionManager = await hre.ethers.getContractFactory("NonfungiblePositionManager");
    const nftpm = await NonfungiblePositionManager.deploy(factory, wsmr, nftPD.address)
    console.log(`Deployed NonfungiblePositionManager to ${nftpm.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
