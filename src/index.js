import { loadCompiler, doCompilation } from './compilation.js'

const run = async () => {
    const source = {
        'token.sol': {
            content: `// SPDX-License-Identifier: MIT
                pragma solidity ^0.8.20;
                
                import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
                
                contract MyToken is ERC721 {
                    constructor() ERC721("MyToken", "MTK") {}
                }
                `
        }
    } 
    const compilerConfig = {
        currentCompilerUrl: 'v0.8.25+commit.b61c2a91',
        evmVersion: null, // default evm version
        optimize: false,
        runs: 200
    }
    const compiler = await loadCompiler(compilerConfig)
    const compilationResult = await doCompilation(source, compiler)
    console.log(compilationResult.data)
    console.log(compilationResult.data.errors)
  }

  run()
