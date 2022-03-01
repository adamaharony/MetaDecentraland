App = {
    web3Provider: null,
    VALUES: {
        LANDS: {
            owned: new Map(),
        }
    },
    contracts: {},
    metadata: [],
    account: null,
    originalOwner: "0x0000000000000000000000000000000000000001",

    initHTML: () => {
        // let d
        $.getJSON("./lands.json", (data) => {
            App.VALUES.LANDS.metadata = data
            let LANDRow = $('#LANDRow')
            let LANDTemplate = $('#LANDTemplate')
            let land, colour

            LANDRow.append("<table style='margin-left: auto; margin-right: auto;'>")
            for (let i = 0; i < App.VALUES.LANDS.metadata.length; i++) {
                LANDRow.append("<tr>")
                for (let j = 0; j < App.VALUES.LANDS.metadata[i].length; j++) {
                    land = App.VALUES.LANDS.metadata[i][j]
                    switch (land.type) {
                        case "Land":
                            colour = "brown"
                            LANDTemplate.find('.btn-land-purchase').attr('style', "display: flex")
                            LANDTemplate.find('.price').text(App.VALUES.LANDS.metadata[i][j].price)
                            LANDTemplate.find('.btn-purchase').attr('price', App.VALUES.LANDS.metadata[i][j].price)
                            break
                        case "Road":
                            colour = "grey"
                            LANDTemplate.find('.btn-land-purchase').attr('style', "display: none")
                            LANDTemplate.find('.price').text("")
                            break
                        case "Park":
                            colour = "green"
                            LANDTemplate.find('.btn-land-purchase').attr('style', "display: none")
                            LANDTemplate.find('.price').text("")
                            break
                    }

                    LANDTemplate.find('.type').text(App.VALUES.LANDS.metadata[i][j].type)
                    LANDTemplate.find('.coords').text(App.VALUES.LANDS.metadata[i][j].coords)
                    LANDTemplate.find('.btn-land-purchase').attr('id-x', i)
                    LANDTemplate.find('.btn-land-purchase').attr('id-y', j)
                    LANDTemplate.find('.btn-land-purchase').attr('id', parseInt(i * App.VALUES.LANDS.metadata.length + j))
                    LANDTemplate.find('.btn-land-transfer').attr('id-x', i)
                    LANDTemplate.find('.btn-land-transfer').attr('id-y', j)
                    LANDTemplate.find('.btn-land-transfer').attr('id', parseInt(i * App.VALUES.LANDS.metadata.length + j))
                    LANDTemplate.find('.btn-land-game').attr('id-x', i)
                    LANDTemplate.find('.btn-land-game').attr('id-y', j)
                    LANDTemplate.find('.btn-land-game').attr('id', parseInt(i * App.VALUES.LANDS.metadata.length + j))
                    LANDTemplate.find('.btn-land-set-game').attr('id-x', i)
                    LANDTemplate.find('.btn-land-set-game').attr('id-y', j)
                    LANDTemplate.find('.btn-land-set-game').attr('id', parseInt(i * App.VALUES.LANDS.metadata.length + j))
                    LANDTemplate.find(".panel-body").attr('style', `background-color: ${colour}`)
                    LANDRow.append("<td>" + LANDTemplate.html() + "</td>")
                }
                LANDRow.append("</tr>")
            }
            LANDRow.append("</table>")
        })

        return App.bindEvents()
    },

    initWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.request({method: "eth_requestAccounts"})
                let accs = await window.ethereum.request({method: 'eth_accounts'})
                App.account = accs[0]
                // App.originalOwner = accs[1]
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
        }
        web3 = new Web3(App.web3Provider)

        return App.initContracts()
    },

    initContracts: () => {
        $.getJSON('Land.json', (data) => {
            App.contracts.Land = TruffleContract(data)
            App.contracts.Land.setProvider(App.web3Provider)

            return App.markPurchased()
        })
        $.getJSON('ERC20.json', (data) => {
            App.contracts.Token = TruffleContract(data)
            App.contracts.Token.setProvider(App.web3Provider)

            return App.getData()
        })

        return App.initHTML()
    },

    bindEvents: () => {
        $(document).on('click', '.btn-land-purchase', App.handlePurchase)
        $(document).on('click', '.btn-land-transfer', App.handleTransfer)
        $(document).on('click', '.btn-land-game', App.joinGame)
        $(document).on('click', '.btn-land-set-game', App.setGame)

    },

    setGame: async (event) => {
        event.preventDefault();

        let landID = parseInt($(event.target).attr('id'))
        let landX = parseInt($(event.target).attr('id-x'))
        let landY = parseInt($(event.target).attr('id-y'))

        let game = window.prompt("Enter game URL:")
        let landInstance = await App.contracts.Land.deployed()
        landInstance.setGame(landID, game, {from: App.account}).then((result) => {
            console.log(result)
        })
        App.getData()
        App.markPurchased()
        location.reload()
    },

    joinGame: async (event) => {
        event.preventDefault();

        let landID = parseInt($(event.target).attr('id'))
        let landX = parseInt($(event.target).attr('id-x'))
        let landY = parseInt($(event.target).attr('id-y'))

        let landInstance = await App.contracts.Land.deployed()
        let game = await landInstance.getGame(landID)
        window.open(game, "_blank")
        App.getData()
    },

    getData: () => {
        App.contracts.Token.deployed().then(async (instance) => {
            let acc = App.account
            let bal = await instance.balanceOf(acc, {from: acc})
            let dec = await instance.decimals({from: acc})
            let name = await instance.name({from: acc})
            let symbol = await instance.symbol({from: acc})

            App.VALUES.BALANCE = bal.toNumber()
            App.VALUES.DECIMALS = dec.toNumber()
            App.VALUES.NAME = name
            App.VALUES.SYMBOL = symbol
        }).then((result) => {
            $('#TokenBalance').text(`${App.VALUES.BALANCE / Math.pow(10, App.VALUES.DECIMALS)} ${App.VALUES.SYMBOL}`)
            let lands = 0
            App.VALUES.LANDS.owned.forEach((owner, index) => {
                if (owner === App.account) {
                    lands++
                }
            })
            $('#NFTBalance').text(`${lands}`)
        })
    },

    markPurchased: () => {
        App.contracts.Land.deployed().then(async (instance) => {
            let acc = App.account
            let amount = await instance._tokenIds({from: acc})
            amount = amount.toNumber()
            for (i = 0; i < amount; i++) {
                let owner = await instance.ownerOf(i, {from: acc})
                App.VALUES.LANDS.owned.set(i, owner)
                let game = await instance.getGame(i)
                if (game !== "")
                    $('.panel-LAND').eq(i).find('.btn-land-game').attr('style', "display: flex")
                if (owner !== App.originalOwner) {
                    $('.panel-LAND').eq(i).find('.btn-land-purchase').html(`Owned by <small style="font-size: 9px">${owner}</small>`).attr('disabled', true)
                    if (owner === App.account) {
                        $('.panel-LAND').eq(i).find('.btn-land-transfer').attr('style', "display: flex")
                        $('.panel-LAND').eq(i).find('.btn-land-set-game').attr('style', "display: flex")
                    }
                }
            }
            return App.getData()
        })
    },

    handlePurchase: async (event) => {
        event.preventDefault();

        let landID = parseInt($(event.target).attr('id'))
        let landX = parseInt($(event.target).attr('id-x'))
        let landY = parseInt($(event.target).attr('id-y'))
        console.log(event)
        try {
            let account = App.account
            let tokenInstance = await App.contracts.Token.deployed()
            let landInstance = await App.contracts.Land.deployed()

            let URI = App.VALUES.LANDS.metadata[landX][landY]
            let price = URI.price
            let owner = await landInstance.ownerOf(landID, {from: account})
            let dec = await tokenInstance.decimals({from: account})
            dec = dec.toNumber()
            let result = await tokenInstance.transfer(owner, price * Math.pow(10, dec), {from: account})
            result = await landInstance.transferFrom(owner, account, landID, {from: account})
            App.markPurchased()
            App.getData()
        } catch (err) {
            console.error(err)
        }
    },

    handleTransfer: (event) => {
        event.preventDefault();

        let landID = parseInt($(event.target).attr('id'))
        let landX = parseInt($(event.target).attr('id-x'))
        let landY = parseInt($(event.target).attr('id-y'))

        App.contracts.Land.deployed().then((instance) => {
            let addr = window.prompt("Enter the address to transfer to")

            instance.transferFrom(App.account, addr, landID, {from: App.account}).then((result) => {
                console.log(result)
                $('.panel-NFT').eq(i).find('.btn-transfer').attr('style', "display: hidden")
                return App.markPurchased()
            })
        }).catch((err) => {
            console.error(err)
        })

        location.reload()
    }

}

$(() => {
    $(window).load(() => {
        App.initWeb3()
    })
})
