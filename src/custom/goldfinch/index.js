import axios from "axios";
import {ethers} from "ethers";

const provider = new ethers.providers.JsonRpcProvider(null, "mainnet");

const poolTokensAddress = "0x57686612C601Cb5213b01AA8e80AfEb24BBd01df";
const poolTokensAbi = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const poolTokensContract = new ethers.Contract(poolTokensAddress, poolTokensAbi, provider);

const metadataBaseURI = "https://us-central1-goldfinch-frontends-prod.cloudfunctions.net/poolTokenMetadata";

export const fetchToken = async (_chainId, { contract, tokenId }) => {
  const response = await axios.get(`${metadataBaseURI}/${tokenId}`);
  return {
    contract,
    tokenId,
    name: response.data.name,
    imageUrl: response.data.image,
    attributes: response.data.attributes,
  };
};

export const fetchContractTokens = async (_chainId, contract, continuation) => {
  const pageSize = 1000;
  const totalSupply = await poolTokensContract.totalSupply();
  // tokenId starts at 1 (0 was never minted)
  const tokenIdRange = [1, totalSupply];

  const minTokenId = continuation
    ? Math.max(continuation, tokenIdRange[0])
    : tokenIdRange[0];
  const maxTokenId = continuation
    ? Math.min(continuation + pageSize, tokenIdRange[1])
    : tokenIdRange[1];

  const assets = [];
  for (let tokenId = minTokenId; tokenId <= maxTokenId; tokenId++) {
    assets.push(fetchToken(_chainId, { contract, tokenId }));
  }

  return {
    continuation: maxTokenId === tokenIdRange[1] ? undefined : maxTokenId + 1,
    metadata,
  };
};
