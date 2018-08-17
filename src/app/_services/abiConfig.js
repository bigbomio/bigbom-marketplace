import IPFS from 'ipfs-mini';

import BBFreelancerJob from '../_services/abi/BBFreelancerJob.json';
import BBFreelancerBid from '../_services/abi/BBFreelancerBid.json';
import BBFreelancerPayment from '../_services/abi/BBFreelancerPayment.json';
import BigbomTokenExtended from '../_services/abi/BigbomTokenExtended.json'; // bbo

const abiConfigs = {
    getContract: type => {
        switch (type) {
            case 'BBFreelancerJob':
                return {
                    address: '0x62aa93f9dffec25daf9d2955d468194e996e8c87',
                    abi: BBFreelancerJob.abi,
                };
            case 'BBFreelancerBid':
                return {
                    address: '0x0ff11890ef301dfd0fb37e423930b391836c69c9',
                    abi: BBFreelancerBid.abi,
                };
            case 'BBFreelancerPayment':
                return {
                    address: '0x7b7e6f2b02a48bd24b5b1554fafff5f70547ab0a',
                    abi: BBFreelancerPayment.abi,
                };
            case 'BigbomTokenExtended':
                return {
                    address: '0x1d893910d30edc1281d97aecfe10aefeabe0c41b',
                    abi: BigbomTokenExtended.abi,
                };
            default:
                return {
                    address: '0x62aa93f9dffec25daf9d2955d468194e996e8c87',
                    abi: BBFreelancerJob.abi,
                };
        }
    },

    getIpfs: () => {
        return new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    },

    getIpfsLink: () => {
        return 'https://ipfs.infura.io/ipfs/';
    },
};

export default abiConfigs;
