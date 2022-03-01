const fs = require("fs")
const Land = artifacts.require("Land")
const ERC20 = artifacts.require("ERC20")
const lands = JSON.parse(fs.readFileSync("../src/lands.json")).flat()
const originalOwner = "0x0000000000000000000000000000000000000001"
const URIS = []
for (let i = 0; i < lands.length; i++) {
  URIS.push(JSON.stringify(lands[i]))
}

module.exports = (deployer) => {
    deployer.deploy(Land, originalOwner, URIS)
    deployer.deploy(ERC20, 10_000, "Maor-Adam Token", 1, "MAT")
}