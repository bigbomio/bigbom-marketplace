import IPFS from 'ipfs-mini';
import Utils from '../_utils/utils';

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

const ropstenAbi = {
    dev: {
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

        // BBFreelancerJob: {
        //     address: '0xb1e878028d0e3e47c803cbb9d1684d9d3d72a1b1',
        //     abi: BBFreelancerJob_dev,
        // },
        // BBFreelancerBid: {
        //     address: '0x7b388ecfec2f5f706aa34b540a39e8c434cfc8b4',
        //     abi: BBFreelancerBid_dev,
        // },
        // BBFreelancerPayment: {
        //     address: '0x253f112b946a72a008343d5bccd14e04288ca45c',
        //     abi: BBFreelancerPayment_dev,
        // },
        // BBRating: {
        //     address: '0xb7786dd5e27926c9753e00dc582d1e707b147ceb',
        //     abi: BBRating_dev,
        // },
        // BigbomTokenExtended: {
        //     address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
        //     abi: BigbomTokenExtended_dev,
        // },
        // BBVotingHelper: {
        //     address: '0x771911025b4eafb6395042b7dca728b275e5d8c0',
        //     abi: BBVotingHelper_dev,
        // },
        // BBDispute: {
        //     address: '0x2b44a5589e8b3cd106a7542d4af9c5eb0016ef6e',
        //     abi: BBDispute_dev,
        // },
        // BBVoting: {
        //     address: '0xc7252214d78b15f37b94ae73027419a9f275c36f',
        //     abi: BBVoting_dev,
        // },
        // BBParams: {
        //     address: '0xc0647055b50dce8751908bfbd7f1d219ed592d6f',
        //     abi: BBParams_dev,
        // },
    },
    uat: {
        ...this.dev,
    },
    production: {
        ...this.dev,
    },
};

// const rinkebyAbi = {
//     BBFreelancerJob: {
//         address: '0x71356605e4f79fd07b01cc187bdcbc1f4025db1f',
//         abi: BBFreelancerJob.abi,
//     },
//     BBFreelancerBid: {
//         address: '0xf01cc898b9245930a345bec82423b87f602cb8e4',
//         abi: BBFreelancerBid.abi,
//     },
//     BBFreelancerPayment: {
//         address: '0x22ce61d3c44e5a005a9b9f4485cfbc660c1c2ef3',
//         abi: BBFreelancerPayment.abi,
//     },
//     BigbomTokenExtended: {
//         address: '0x2ddc511802a37039c42c6bdb36028b2f8992b0fe',
//         abi: BigbomTokenExtended.abi,
//     },
//     BBDispute: {
//         address: '0x278636913d5203a057adb7e0521b8df9431bdaa5',
//         abi: BBDispute.abi,
//     },
//     BBVoting: {
//         address: '0x54a7cb877948518444e4c97c426cf47718ac94c3',
//         abi: BBVoting.abi,
//     },
//     BBParams: {
//         address: '0xb1b1e7f9223bca9d66aa97b773935d4aec13165d',
//         abi: BBParams.abi,
//     },
// };

//let fromBlock = 3165089; // rinkeby
export const fromBlock = 4552643; // ropsten

class abiConfigs {
    getContract(type) {
        return ropstenAbi[env][type];
    }

    getIpfs() {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    getIpfsLink() {
        //return 'https://ipfs.infura.io/ipfs/';
        return 'https://cloudflare-ipfs.com/ipfs/';
    }

    getTXlink() {
        return 'https://ropsten.etherscan.io/tx/';
        //return 'https://rinkeby.etherscan.io/tx/'; //'RINKEBY';
    }

    async contractInstanceGenerator(web3, type) {
        const defaultAccount = web3.eth.defaultAccount;
        const address = this.getContract(type).address;
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
