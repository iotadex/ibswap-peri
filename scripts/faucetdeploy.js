// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const FaucetERC20 = await hre.ethers.getContractFactory("TokenERC20");

    const SOONt1 = await FaucetERC20.deploy("Soon test", "SOONtest", 8);
    console.log(`SOONt1 was Deployed to : ${SOONt1.address}`);

    const symbol = "TT1";
    const tt = await FaucetERC20.deploy("Soon test", "SOONtest", 8);
    console.log(`${symbol} was Deployed to : ${tt.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
