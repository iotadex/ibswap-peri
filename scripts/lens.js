// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const wsmr = "0xEA2000b8CdB129A27b40188aBaFEef59958403Fd";
    const factory = "0x2972A77755621a7c57621C6EC1BCB720c36A28f5";

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
