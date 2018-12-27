import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';

import { store } from '../stores';

//import web3v1 from './web3'; // web3 v1

import BBFreelancerJob_dev from '../_services/abi_dev/BBFreelancerJob.json';
import BBFreelancerBid_dev from '../_services/abi_dev/BBFreelancerBid.json';
import BBFreelancerPayment_dev from '../_services/abi_dev/BBFreelancerPayment.json';
import BigbomTokenExtended_dev from '../_services/abi_dev/BigbomTokenExtended.json'; // bbo
import BBVotingHelper_dev from '../_services/abi_dev/BBVotingHelper.json';
import BBDispute_dev from '../_services/abi_dev/BBDispute.json';
import BBVoting_dev from '../_services/abi_dev/BBVoting.json';
import BBParams_dev from '../_services/abi_dev/BBParams.json';
import BBRating_dev from '../_services/abi_dev/BBRating.json';

const env = process.env.REACT_APP_ENV;

const rinkebyAbi = {
    BBFreelancerJob: {
        address: '0x7e568533c8d7aeb8e0e3dc4f985ebe7383335e9a',
        abi: BBFreelancerJob_dev,
    },
    BBFreelancerBid: {
        address: '0x45f770502cdba34c88e629828623d7a791c88d69',
        abi: BBFreelancerBid_dev,
    },
    BBFreelancerPayment: {
        address: '0xbe1e81348fbfcca03118ab146cfaae2f8564a1b4',
        abi: BBFreelancerPayment_dev,
    },
    BBRating: {
        address: '0xdd7d43a4802e968fd23275f0996dff09e1e706a7',
        abi: BBRating_dev,
    },
    BigbomTokenExtended: {
        address: '0xc94850af313f311b0a8aa492817100bd4bcd4fb2',
        abi: BigbomTokenExtended_dev,
    },
    BBVotingHelper: {
        address: '0x07405fce52ac55bfedafa7855a77a0d049b0c33d',
        abi: BBVotingHelper_dev,
    },
    BBDispute: {
        address: '0x2fc06d443387a17597d3f20dcba2f520f6640d3f',
        abi: BBDispute_dev,
    },
    BBVoting: {
        address: '0x0ffb85883482c42a45a7cf21a22b0d30d9b7341d',
        abi: BBVoting_dev,
    },
    BBParams: {
        address: '0xf5c2425dbf3aa9bbddbfdb54883a46c8fbb2f716',
        abi: BBParams_dev,
    },
};

const ropstenAbi = {
    BBFreelancerJob: {
        address: '0x0c31cb2173d03321f2f167328333eaf2e4d13a8e',
        abi: BBFreelancerJob_dev,
    },
    BBFreelancerBid: {
        address: '0x086f13456f962f0363a1c684b3ae3329d3b2676f',
        abi: BBFreelancerBid_dev,
    },
    BBFreelancerPayment: {
        address: '0xf5cf17e2059b78ca9012475309c296c4e6c8a79c',
        abi: BBFreelancerPayment_dev,
    },
    BBRating: {
        address: '0xe177b6568e4a62f0b8ae3e145f222d411926034e',
        abi: BBRating_dev,
    },
    BigbomTokenExtended: {
        address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
        abi: BigbomTokenExtended_dev,
    },
    BBVotingHelper: {
        address: '0x457b7c89bac3e5bd35db5f80cf78cab7ad1207b5',
        abi: BBVotingHelper_dev,
    },
    BBDispute: {
        address: '0xd3471fd83e7f17f5b39792ed35ded27582fc11f6',
        abi: BBDispute_dev,
    },
    BBVoting: {
        address: '0x13d149ff5b9bdac07ddc776f7baf5ac7daa83510',
        abi: BBVoting_dev,
    },
    BBParams: {
        address: '0x76ec7e437e946b07f3a78928a51d36cdcf447f0c',
        abi: BBParams_dev,
    },
};

const abi = {
    dev: {
        ...ropstenAbi,
    },
    uat: {
        ...rinkebyAbi,
    },
    production: {
        ...rinkebyAbi,
    },
};

const fromBlockList = {
    dev: 4552643, // ropsten
    uat: 3483605, // rinkeby
    production: 3483605, // rinkeby
};

const txLinks = {
    dev: 'https://ropsten.etherscan.io/tx/', // ropsten
    uat: 'https://rinkeby.etherscan.io/tx/', // rinkeby
    production: 'https://rinkeby.etherscan.io/tx/', // rinkeby
};

export const fromBlock = fromBlockList[env];

export const currentToken = { symbol: 'BBO', address: abi[env].BigbomTokenExtended.address };

class abiConfigs {
    getContract(type) {
        return abi[env][type];
    }

    getIpfs() {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    getIpfsLink() {
        //return 'https://ipfs.infura.io/ipfs/';
        return 'https://cloudflare-ipfs.com/ipfs/';
    }

    getTXlink() {
        return txLinks[env];
    }

    async contractInstanceGenerator(web3, type, token) {
        try {
            const defaultAccount = web3.eth.defaultAccount;
            let address = this.getContract(type).address;
            const reducers = store.getState();
            if (token) {
                address = reducers.CommonReducer.currentToken.address;
            }
            const abi = this.getContract(type).abi;
            const abiInstance = web3.eth.contract(abi);
            const instance = await abiInstance.at(address);
            const gasPrice = await Utils.callMethodWithReject(web3.eth.getGasPrice)();
            return {
                defaultAccount,
                instance,
                gasPrice,
                address,
            };
        } catch (err) {
            console.log(err);
        }
    }

    async transactionWatch(web3, hashString, callback) {
        async function getReceipt() {
            const [, receipt] = await Utils.callMethod(web3.eth.getTransactionReceipt)(hashString);
            if (receipt) {
                if (receipt.blockNumber !== null) {
                    clearInterval(watch);
                    callback();
                    return;
                }
            }
        }
        const watch = setInterval(async () => {
            getReceipt();
        }, 1000);
    }
}

export default new abiConfigs();
