/**
 * 🔗 BLOCKCHAIN CONFIGURATION - Selene ↔ DentiaRewards Bridge
 * ═══════════════════════════════════════════════════════════════
 * 
 * Configuration for connecting Selene Core to the DENTIA token ecosystem.
 * 
 * SECURITY NOTES:
 * - OPERATOR_PRIVATE_KEY must be stored securely (env var, secrets manager)
 * - Hot wallet should have minimal ETH (only for gas)
 * - Monitor wallet balance and set up alerts
 * 
 * ARCHITECTURE:
 * ┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
 * │   Selene    │───▶│ BlockchainService │───▶│  DentiaRewards  │
 * │   Core      │    │   (ethers.js)     │    │   (Smart Cont.) │
 * └─────────────┘    └──────────────────┘    └─────────────────┘
 *       │                                              │
 *       │           FIAT Payment Validated             │
 *       └──────────────────────────────────────────────┘
 *                          │
 *                          ▼
 *                   $DENTIA Tokens
 *                   sent to patient
 */

import { ethers } from 'ethers';

// ═══════════════════════════════════════════════════════════════
// NETWORK CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export type SupportedNetwork = 'sepolia' | 'polygon' | 'mumbai' | 'localhost';

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://1rpc.io/sepolia',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  },
  mumbai: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES (Update after deployment)
// ═══════════════════════════════════════════════════════════════

/**
 * Contract addresses per network
 * 
 * TODO: Update these after running deploy.ts
 * Format: { network: { contractName: address } }
 */
export const CONTRACT_ADDRESSES: Record<SupportedNetwork, {
  dentiaCoin: string;
  dentiaRewards: string;
}> = {
  localhost: {
    dentiaCoin: '0x0000000000000000000000000000000000000000',
    dentiaRewards: '0x0000000000000000000000000000000000000000',
  },
  sepolia: {
    // ═══════════════════════════════════════════════════════════
    // 🚨 UPDATE THESE AFTER DEPLOYMENT TO SEPOLIA
    // ═══════════════════════════════════════════════════════════
    dentiaCoin: process.env.DENTIA_COIN_ADDRESS || '0x0000000000000000000000000000000000000000',
    dentiaRewards: process.env.DENTIA_REWARDS_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  mumbai: {
    dentiaCoin: process.env.DENTIA_COIN_ADDRESS || '0x0000000000000000000000000000000000000000',
    dentiaRewards: process.env.DENTIA_REWARDS_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  polygon: {
    dentiaCoin: process.env.DENTIA_COIN_ADDRESS || '0x0000000000000000000000000000000000000000',
    dentiaRewards: process.env.DENTIA_REWARDS_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTRACT ABIs (Minimal interface for what Selene needs)
// ═══════════════════════════════════════════════════════════════

/**
 * DentiaRewards ABI - Only functions Selene needs to call
 */
export const DENTIA_REWARDS_ABI = [
  // Read functions
  'function treasuryBalance() external view returns (uint256)',
  'function getRemainingDailyAllowance(address patient) external view returns (uint256 remainingAllowance, uint256 resetTime)',
  'function isNonceUsed(address operator, uint256 nonce) external view returns (bool)',
  'function getStatistics() external view returns (uint256 totalDistributed, uint256 totalPatients, uint256 treasuryBalance)',
  'function hasReceivedRewards(address patient) external view returns (bool)',
  
  // Write functions (requires OPERATOR_ROLE)
  'function rewardPatient(address patientWallet, uint256 amount, uint256 nonce, string calldata reason) external',
  'function batchRewardPatients(address[] calldata patients, uint256[] calldata amounts, uint256[] calldata nonces, string[] calldata reasons) external',
  
  // Events
  'event RewardDistributed(address indexed patient, uint256 amount, uint256 indexed operatorNonce, address indexed operator, string reason)',
];

/**
 * DentiaCoin ABI - Read-only functions for balance checking
 */
export const DENTIA_COIN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function circulatingSupply() external view returns (uint256)',
  'function burnedSupply() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event TokensBurnedForService(address indexed patient, uint256 amount, bytes32 indexed serviceId)',
];

// ═══════════════════════════════════════════════════════════════
// BLOCKCHAIN CONFIG
// ═══════════════════════════════════════════════════════════════

export interface BlockchainConfig {
  /** Current active network */
  network: SupportedNetwork;
  
  /** Is blockchain integration enabled? */
  enabled: boolean;
  
  /** Operator wallet private key (Selene hot wallet) */
  operatorPrivateKey: string;
  
  /** Reward amount per unit of payment (e.g., 1 DENTIA per 1 ARS spent) */
  rewardRatio: number;
  
  /** Minimum payment amount to trigger reward (in cents) */
  minPaymentForReward: number;
  
  /** Maximum reward per transaction (in DENTIA) */
  maxRewardPerTx: number;
  
  /** Gas price multiplier for faster confirmations (1.0 = normal) */
  gasPriceMultiplier: number;
  
  /** Retry configuration */
  retry: {
    attempts: number;
    delayMs: number;
  };
}

/**
 * Default blockchain configuration
 * Override with environment variables in production
 */
export const blockchainConfig: BlockchainConfig = {
  // Network selection
  network: (process.env.BLOCKCHAIN_NETWORK as SupportedNetwork) || 'sepolia',
  
  // Master switch - set to false to disable all blockchain features
  enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  
  // Selene hot wallet private key
  // ⚠️ NEVER hardcode this - always use environment variable
  operatorPrivateKey: process.env.SELENE_OPERATOR_PRIVATE_KEY || '',
  
  // Reward economics
  // Example: 100 DENTIA per 1000 ARS payment = 0.1 ratio
  rewardRatio: parseFloat(process.env.DENTIA_REWARD_RATIO || '0.1'),
  
  // Minimum payment to get rewards (10 ARS = 1000 cents)
  minPaymentForReward: parseInt(process.env.MIN_PAYMENT_FOR_REWARD || '1000', 10),
  
  // Cap at 100,000 DENTIA per transaction
  maxRewardPerTx: parseInt(process.env.MAX_REWARD_PER_TX || '100000', 10),
  
  // Gas price bump for priority
  gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2'),
  
  // Retry failed transactions
  retry: {
    attempts: 3,
    delayMs: 5000,
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the current network configuration
 */
export function getCurrentNetwork(): NetworkConfig {
  return NETWORKS[blockchainConfig.network];
}

/**
 * Get contract addresses for current network
 */
export function getContractAddresses() {
  return CONTRACT_ADDRESSES[blockchainConfig.network];
}

/**
 * Create ethers provider for current network
 */
export function createProvider(): ethers.JsonRpcProvider {
  const network = getCurrentNetwork();
  return new ethers.JsonRpcProvider(network.rpcUrl, {
    chainId: network.chainId,
    name: network.name,
  });
}

/**
 * Create signer (wallet) for Selene operator
 */
export function createOperatorSigner(): ethers.Wallet {
  if (!blockchainConfig.operatorPrivateKey) {
    throw new Error('❌ SELENE_OPERATOR_PRIVATE_KEY not configured');
  }
  
  const provider = createProvider();
  return new ethers.Wallet(blockchainConfig.operatorPrivateKey, provider);
}

/**
 * Create DentiaRewards contract instance (connected to operator signer)
 */
export function createDentiaRewardsContract(): ethers.Contract {
  const signer = createOperatorSigner();
  const addresses = getContractAddresses();
  
  if (addresses.dentiaRewards === '0x0000000000000000000000000000000000000000') {
    throw new Error('❌ DENTIA_REWARDS_ADDRESS not configured');
  }
  
  return new ethers.Contract(
    addresses.dentiaRewards,
    DENTIA_REWARDS_ABI,
    signer
  );
}

/**
 * Create DentiaCoin contract instance (read-only)
 */
export function createDentiaCoinContract(): ethers.Contract {
  const provider = createProvider();
  const addresses = getContractAddresses();
  
  if (addresses.dentiaCoin === '0x0000000000000000000000000000000000000000') {
    throw new Error('❌ DENTIA_COIN_ADDRESS not configured');
  }
  
  return new ethers.Contract(
    addresses.dentiaCoin,
    DENTIA_COIN_ABI,
    provider
  );
}

/**
 * Convert DENTIA amount to wei (18 decimals)
 */
export function dentiaToWei(amount: number): bigint {
  return ethers.parseEther(amount.toString());
}

/**
 * Convert wei to DENTIA (18 decimals)
 */
export function weiToDentia(wei: bigint): number {
  return parseFloat(ethers.formatEther(wei));
}

/**
 * Calculate reward amount based on payment
 * @param paymentAmountCents Payment amount in cents (ARS)
 * @returns Reward amount in DENTIA (not wei)
 */
export function calculateRewardAmount(paymentAmountCents: number): number {
  // Check minimum payment threshold
  if (paymentAmountCents < blockchainConfig.minPaymentForReward) {
    return 0;
  }
  
  // Calculate base reward
  const paymentInUnits = paymentAmountCents / 100; // Convert cents to base currency
  let reward = paymentInUnits * blockchainConfig.rewardRatio;
  
  // Apply cap
  reward = Math.min(reward, blockchainConfig.maxRewardPerTx);
  
  // Round to 2 decimals
  return Math.round(reward * 100) / 100;
}

/**
 * Generate unique nonce for blockchain transaction
 * Combines timestamp with random component
 */
export function generateTransactionNonce(): bigint {
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1000000));
  return timestamp * 1000000n + random;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate blockchain configuration
 * Call this at startup to catch config errors early
 */
export async function validateBlockchainConfig(): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if enabled
  if (!blockchainConfig.enabled) {
    warnings.push('⚠️ Blockchain integration is DISABLED');
    return { valid: true, errors, warnings };
  }
  
  // Check operator private key
  if (!blockchainConfig.operatorPrivateKey) {
    errors.push('❌ SELENE_OPERATOR_PRIVATE_KEY is required when blockchain is enabled');
  }
  
  // Check contract addresses
  const addresses = getContractAddresses();
  if (addresses.dentiaRewards === '0x0000000000000000000000000000000000000000') {
    errors.push('❌ DENTIA_REWARDS_ADDRESS not configured');
  }
  if (addresses.dentiaCoin === '0x0000000000000000000000000000000000000000') {
    errors.push('❌ DENTIA_COIN_ADDRESS not configured');
  }
  
  // Check network connectivity (only if no prior errors)
  if (errors.length === 0) {
    try {
      const provider = createProvider();
      const network = await provider.getNetwork();
      const expectedChainId = getCurrentNetwork().chainId;
      
      if (Number(network.chainId) !== expectedChainId) {
        errors.push(`❌ Chain ID mismatch: expected ${expectedChainId}, got ${network.chainId}`);
      }
      
      // Check operator balance
      const signer = createOperatorSigner();
      const balance = await provider.getBalance(signer.address);
      const balanceEth = parseFloat(ethers.formatEther(balance));
      
      if (balanceEth < 0.01) {
        warnings.push(`⚠️ Operator wallet low on gas: ${balanceEth.toFixed(4)} ETH`);
      }
      
      console.log(`✅ Connected to ${getCurrentNetwork().name} (chainId: ${network.chainId})`);
      console.log(`💰 Operator balance: ${balanceEth.toFixed(4)} ETH`);
      
    } catch (err: any) {
      errors.push(`❌ Failed to connect to blockchain: ${err.message}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default blockchainConfig;
