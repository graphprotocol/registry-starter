const ethers = require('ethers')

const ganacheMneumonic =
    'myth like bonus scare over problem client lizard pioneer submit female collect'

const walletPaths = {
    zero: "m/44'/60'/0'/0/0",
    one: "m/44'/60'/0'/0/1",
    two: "m/44'/60'/0'/0/2",
    three: "m/44'/60'/0'/0/3",
    four: "m/44'/60'/0'/0/4",
    five: "m/44'/60'/0'/0/5",
    six: "m/44'/60'/0'/0/6",
    seven: "m/44'/60'/0'/0/7",
    eight: "m/44'/60'/0'/0/8",
    nine: "m/44'/60'/0'/0/9"
}

const wallets = {
    zero: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.zero),
    one: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.one),
    two: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.two),
    three: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.three),
    four: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.four),
    five: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.five),
    six: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.six),
    seven: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.seven),
    eight: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.eight),
    nine: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.nine),
}
const config = {
    tokenRegistryParams: {
        owner: wallets.zero().signingKey.address, // Ganache deterministic account 0
        ropstenOwner: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd', // Daves metamask account 0
        votingPeriodDuration: 432000, // 5 days, in seconds
        challengeDeposit: '10000000000000000000', // $1 DAI challenge fee
        applicationFee: '10000000000000000000', // $1 DAI application fee
        // Charter is fake IPFS hash, in bytes, not base58
        charter: '0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    },
    ganacheParams: {
        ethereumDIDRegistryAddress: '', // Not in use, is inserted upon creation
        wallets: wallets
    },
    testnetParams: {
        supply: '100000000000000000000000000', // $100M DAI supply
        amountToEachAccount: '20000000000000000000000000', // $20M DAI to 5 accounts
        name: 'MockDAI',
        // Note the DID address is the same for mainnet, ropsten, rinkeby, kovan and goerli
        ethereumDIDRegistryAddress: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
    },
    mainnetParams: {
        daiAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        ethereumDIDRegistryAddress: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
 
    },
    // Used for deployng and interacting on testnets
    // These should be 5 metamask accounts in your own browser
    metamaskAddresses: {
        zero: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd',
        one: '0x7F11E5B7Fe8C04c1E4Ce0dD98aC5c922ECcfA4ed',
        two: '0x140b9b9756cE3dE8c8fD296FC9D3E7B3AAa1Cb16',
        three: '0x14B98b26D82421a27608B21BaF6BdEfc181DE546',
        four: '0xc1240aF85fFAc1Dbf826b7250db2644D62c728c8'
    },
    wallets: wallets
}
module.exports = config
