import { loadCompiler, doCompilation } from './compilation.js'
import  {analyze} from "@nomicfoundation/solidity-analyzer"

import fs from 'fs'
import { get } from 'http'
import { min } from 'mocha/lib/reporters/index.js'

const DEFAULT_SOLC_VERSION = "v0.8.25+commit.b61c2a91"
const sol_versions = JSON.parse(fs.readFileSync('./list.json', 'utf-8'))

const get_compiler_version = (sol_src) => {
    const res = analyze(sol_src)
    // console.log(res.versionPragmas[0])
    let max_pragma_version = undefined
    let pragma_version = res.versionPragmas[0].split(' ')[0].split('.')
    pragma_version[0] = pragma_version[0][pragma_version[0].length-1]
    pragma_version = pragma_version.join('.')

    if (res.versionPragmas[0]){
        max_pragma_version = res.versionPragmas[0].split(' ')[1].split('.')
        max_pragma_version[0] = max_pragma_version[0][max_pragma_version[0].length-1]
        max_pragma_version = max_pragma_version.join('.')
    }
    //console.log("max pragma version", max_pragma_version)

    let sol_version = DEFAULT_SOLC_VERSION
    for (let i=0; i<sol_versions['builds'].length; i++){
        if (sol_versions['builds'][i]['version'] === pragma_version){
            // discard nightly builds
            if(sol_versions['builds'][i]['longVersion'].includes('nightly')){
                continue
            }
            sol_version = 'v' + sol_versions['builds'][i]['longVersion']
            // console.log("detected compiler version:", sol_version)
        }

        if (max_pragma_version){
            if (sol_versions['builds'][i]['version'] === max_pragma_version){
                if(sol_versions['builds'][i]['longVersion'].includes('nightly')){
                    continue
                }
                sol_version = 'v' + sol_versions['builds'][i]['longVersion']
                // console.log("detected max compiler version:", sol_version)
                break
            }
        }
    }
    return sol_version
}

const run = async () => {
    const contentsrc = `// SPDX-License-Identifier: MIT
    pragma solidity >=0.8.20 <0.9.0;
    
    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "hardhat/console.sol";
    
    contract MyToken is ERC721 {
        constructor() ERC721("MyToken", "MTK") {}
    }
    `
    const source = {
        'token.sol': {
            content: contentsrc
        }
    }
    const cv = get_compiler_version(contentsrc)

    const compilerConfig = {
        currentCompilerUrl: cv,
        evmVersion: null, // default evm version
        optimize: false,
        runs: 200
    }
    const compiler = await loadCompiler(compilerConfig)
    const compilationResult = await doCompilation(source, compiler)
    if(compilationResult.data.errors === undefined){
        console.log("Compilation succeed!") 
    }else{
        console.log("Compilation failed!")
    }
  }

run()