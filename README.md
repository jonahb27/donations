# InteractionApp

## 1) Make a .env file in the root of the directory:

```
REPORT_GAS=true
COINMARKETCAP_API_KEY=[API key from]
GOERLI_ALCHEMY_API_KEY=[Goerli Alchemy API key]
GOERLI_PRIVATE_KEY=[Goerli Private key]
ROPSTEN_ALCHEMY_API_KEY=[Ropsten Alchemy API key]
ROPSTEN_PRIVATE_KEY=[Ropsten Private key]
RINKEBY_ALCHEMY_API_KEY=[Rinkeby Alchemy API key]
RINKEBY_PRIVATE_KEY=[Rinkeby Private key]
ETHERSCAN_API_KEY=[etherscan api key]
```

comment out `REPORT_GAS` (add `# REPORT_GAS=true`) if you don't want the gas thing

### In order to get the neccisary keys:
* [Coin Market Cap Key](https://coinmarketcap.com/api/) 
* [Alchemy API Keys](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)
* [Private keys](https://docs.alchemy.com/alchemy/introduction/getting-started)

## 2) Github for Dummies

Typical task:
1. make branch
    - Make branch: `git checkout -b "<branch-name>"` 
2. write some code add and commit
    - Add to commit: `git add .` 
    - Commit: `git commit -m "few word explanation"`
3. repeat step 2 until you finish task
4. push the new branch
    - Push: `git push` then copy and past the command it returns and run it
5. ask Jonah to review the branch
6. Jonah will merge the branch
7. Switch back to the main branch
    - See your current branch `git branch`
    - Change branches `git switch <new branch name>`
8. pull changes
    - Pull changes `git pull`


If you find yourself tracking node_modules `git rm -r --cached node_modules`

6. In Terminal, run `npx hardhat run scripts/deploy.js --network ropsten` to deploy the contract on ropsten (note you can run the command with goerli if perffered). 


## 3) Deploy contract:
`npx hardhat run scripts/deploy.js --network ropsten` 

## 4) Verifying the contract:
run `npx hardhat clean` then `npx hardhat verify --network [network name] [contract address]` 

## 5) to check coverage of tests
`npx hardhat coverage`
