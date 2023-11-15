// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

import '../interfaces/ITickLens.sol';

/// @title Tick Lens contract
contract TickLens is ITickLens {
    /// @inheritdoc ITickLens
    function getPopulatedTicksInWord(address pool, int16 tickBitmapIndex)
        public
        view
        override
        returns (PopulatedTick[] memory populatedTicks, uint256 height)
    {
        // fetch bitmap
        uint256 bitmap = IUniswapV3Pool(pool).tickBitmap(tickBitmapIndex);

        // calculate the number of populated ticks
        uint256 numberOfPopulatedTicks;
        for (uint256 i = 0; i < 256; i++) {
            if (bitmap & (1 << i) > 0) numberOfPopulatedTicks++;
        }

        // fetch populated tick data
        int24 tickSpacing = IUniswapV3Pool(pool).tickSpacing();
        populatedTicks = new PopulatedTick[](numberOfPopulatedTicks);
        for (uint256 i = 0; i < 256; i++) {
            if (bitmap & (1 << i) > 0) {
                int24 populatedTick = ((int24(tickBitmapIndex) << 8) + int24(i)) * tickSpacing;
                (uint128 liquidityGross, int128 liquidityNet, , , , , , ) = IUniswapV3Pool(pool).ticks(populatedTick);
                populatedTicks[--numberOfPopulatedTicks] = PopulatedTick({
                    tick: populatedTick,
                    liquidityNet: liquidityNet,
                    liquidityGross: liquidityGross
                });
            }
        }
        height = block.number;
    }

    function ticks(address pool, int24 tick) public view override returns(uint128, int128, uint256) {
        (uint128 liquidityGross, int128 liquidityNet, , , , , , ) = IUniswapV3Pool(pool).ticks(tick);
        return (liquidityGross, liquidityNet, block.number);
    }

    function tickLiquidity(address pool)public view override returns(uint160, int24, uint128, uint256) {
        (uint160 sqrtPriceX96, int24 tick, , , , ,) = IUniswapV3Pool(pool).slot0();
        uint128 liquidity = IUniswapV3Pool(pool).liquidity();
        return (sqrtPriceX96, tick, liquidity, block.number);
    }
}
