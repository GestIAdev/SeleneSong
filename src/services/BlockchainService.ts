/**
 * 🔗 BLOCKCHAIN SERVICE - Selene ↔ DentiaRewards Bridge
 * ═══════════════════════════════════════════════════════════════
 * 
 * Service for distributing $DENTIA rewards to patients when
 * they complete FIAT payments through Dentiagest.
 * 
 * FLOW:
 * 1. Patient pays invoice (FIAT via MercadoPago/Stripe)
 * 2. BillingService marks invoice as PAID
 * 3. BillingService calls blockchainService.rewardPatientForPayment()
 * 4. BlockchainService sends transaction to DentiaRewards contract
 * 5. Patient receives $DENTIA tokens in their wallet
 * 6. VitalPass frontend shows updated balance
 * 
 * SECURITY:
 * - Nonce system prevents replay attacks
 * - Rate limiting enforced on-chain
 * - All transactions logged with invoiceId correlation
 * 
 * @author PunkClaude x GestIA Dev
 */

import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';
import {
  blockchainConfig,
  createDentiaRewardsContract,
  createDentiaCoinContract,
  createOperatorSigner,
  createProvider,
  calculateRewardAmount,
  generateTransactionNonce,
  dentiaToWei,
  weiToDentia,
  getCurrentNetwork,
  getContractAddresses,
} from '../config/blockchain.config.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RewardResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  rewardAmount?: number;
  gasCost?: string;
  error?: string;
  nonce?: string;
}

export interface PatientWalletInfo {
  address: string;
  dentiaBalance: number;
  hasReceivedRewards: boolean;
  dailyAllowanceRemaining: number;
  dailyResetTime: Date;
}

export interface TreasuryStats {
  totalDistributed: number;
  totalPatients: number;
  treasuryBalance: number;
  networkName: string;
  contractAddress: string;
}

export interface BlockchainTransaction {
  id: string;
  invoiceId: string;
  patientId: string;
  patientWallet: string;
  amount: number;
  nonce: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════
// BLOCKCHAIN SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

export class BlockchainService {
  private static instance: BlockchainService;
  private initialized: boolean = false;
  
  // Transaction tracking (in-memory, use Redis/DB in production)
  private pendingTransactions: Map<string, BlockchainTransaction> = new Map();
  
  private constructor() {
    // Singleton pattern
  }
  
  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize the blockchain service
   * Call this at Selene startup
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    console.log('🔗 [BlockchainService] Initializing...');
    
    if (!blockchainConfig.enabled) {
      console.log('⚠️ [BlockchainService] Blockchain integration is DISABLED');
      return false;
    }
    
    try {
      // Verify configuration
      const network = getCurrentNetwork();
      const addresses = getContractAddresses();
      
      console.log(`📡 [BlockchainService] Network: ${network.name} (chainId: ${network.chainId})`);
      console.log(`📄 [BlockchainService] DentiaRewards: ${addresses.dentiaRewards}`);
      console.log(`🪙 [BlockchainService] DentiaCoin: ${addresses.dentiaCoin}`);
      
      // Test connection
      const provider = createProvider();
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ [BlockchainService] Connected! Current block: ${blockNumber}`);
      
      // Check operator wallet
      const signer = createOperatorSigner();
      const balance = await provider.getBalance(signer.address);
      const balanceEth = parseFloat(ethers.formatEther(balance));
      console.log(`💰 [BlockchainService] Operator: ${signer.address}`);
      console.log(`💰 [BlockchainService] Balance: ${balanceEth.toFixed(4)} ETH`);
      
      if (balanceEth < 0.01) {
        console.warn('⚠️ [BlockchainService] LOW GAS WARNING! Add ETH to operator wallet');
      }
      
      this.initialized = true;
      return true;
      
    } catch (error: any) {
      console.error('❌ [BlockchainService] Initialization failed:', error.message);
      return false;
    }
  }
  
  /**
   * Check if service is ready to process transactions
   */
  public isReady(): boolean {
    return this.initialized && blockchainConfig.enabled;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // REWARD DISTRIBUTION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Reward a patient for completing a payment
   * 
   * @param patientWallet Ethereum address of the patient
   * @param paymentAmountCents Payment amount in cents (ARS)
   * @param invoiceId Invoice identifier (for correlation)
   * @param patientId Patient ID in Selene database
   * @returns Result of the reward transaction
   */
  public async rewardPatientForPayment(
    patientWallet: string,
    paymentAmountCents: number,
    invoiceId: string,
    patientId: string
  ): Promise<RewardResult> {
    // Pre-flight checks
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Blockchain service not initialized or disabled',
      };
    }
    
    // Validate wallet address
    if (!ethers.isAddress(patientWallet)) {
      return {
        success: false,
        error: `Invalid wallet address: ${patientWallet}`,
      };
    }
    
    // Calculate reward amount
    const rewardAmount = calculateRewardAmount(paymentAmountCents);
    
    if (rewardAmount === 0) {
      console.log(`⏭️ [BlockchainService] Payment below threshold, no reward for invoice ${invoiceId}`);
      return {
        success: true,
        rewardAmount: 0,
        error: 'Payment below minimum threshold',
      };
    }
    
    // Generate unique nonce
    const nonce = generateTransactionNonce();
    const reason = `PAYMENT_COMPLETED_${invoiceId}`;
    
    // Track transaction
    const txRecord: BlockchainTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invoiceId,
      patientId,
      patientWallet,
      amount: rewardAmount,
      nonce: nonce.toString(),
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.pendingTransactions.set(txRecord.id, txRecord);
    
    console.log(`🎁 [BlockchainService] Rewarding patient...`);
    console.log(`   Invoice: ${invoiceId}`);
    console.log(`   Wallet: ${patientWallet}`);
    console.log(`   Amount: ${rewardAmount} DENTIA`);
    console.log(`   Nonce: ${nonce}`);
    
    try {
      // Get contract instance
      const contract = createDentiaRewardsContract();
      
      // Convert amount to wei
      const amountWei = dentiaToWei(rewardAmount);
      
      // Estimate gas
      const gasEstimate = await contract.rewardPatient.estimateGas(
        patientWallet,
        amountWei,
        nonce,
        reason
      );
      
      // Apply gas multiplier for safety
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // +20%
      
      // Send transaction
      const tx: TransactionResponse = await contract.rewardPatient(
        patientWallet,
        amountWei,
        nonce,
        reason,
        { gasLimit }
      );
      
      console.log(`📤 [BlockchainService] Transaction sent: ${tx.hash}`);
      txRecord.transactionHash = tx.hash;
      
      // Wait for confirmation
      const receipt: TransactionReceipt | null = await tx.wait(1); // 1 confirmation
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      // Update transaction record
      txRecord.status = 'CONFIRMED';
      txRecord.blockNumber = receipt.blockNumber;
      txRecord.confirmedAt = new Date();
      
      const gasCost = ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0n));
      
      console.log(`✅ [BlockchainService] Transaction confirmed!`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas used: ${gasCost} ETH`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        rewardAmount,
        gasCost,
        nonce: nonce.toString(),
      };
      
    } catch (error: any) {
      // Update transaction record
      txRecord.status = 'FAILED';
      txRecord.error = error.message;
      
      console.error(`❌ [BlockchainService] Transaction failed:`, error.message);
      
      // Parse specific errors
      let errorMessage = error.message;
      
      if (error.message.includes('NonceAlreadyUsed')) {
        errorMessage = 'Transaction already processed (replay attack prevented)';
      } else if (error.message.includes('DailyRateLimitExceeded')) {
        errorMessage = 'Patient exceeded daily reward limit';
      } else if (error.message.includes('InsufficientTreasuryBalance')) {
        errorMessage = 'Treasury is depleted - contact admin';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Operator wallet needs more ETH for gas';
      }
      
      return {
        success: false,
        error: errorMessage,
        nonce: nonce.toString(),
      };
    }
  }
  
  /**
   * Batch reward multiple patients
   * More gas-efficient for end-of-day settlements
   */
  public async batchRewardPatients(
    rewards: Array<{
      patientWallet: string;
      paymentAmountCents: number;
      invoiceId: string;
    }>
  ): Promise<RewardResult> {
    if (!this.isReady()) {
      return { success: false, error: 'Blockchain service not ready' };
    }
    
    // Filter and prepare batch data
    const patients: string[] = [];
    const amounts: bigint[] = [];
    const nonces: bigint[] = [];
    const reasons: string[] = [];
    
    for (const reward of rewards) {
      if (!ethers.isAddress(reward.patientWallet)) continue;
      
      const rewardAmount = calculateRewardAmount(reward.paymentAmountCents);
      if (rewardAmount === 0) continue;
      
      patients.push(reward.patientWallet);
      amounts.push(dentiaToWei(rewardAmount));
      nonces.push(generateTransactionNonce());
      reasons.push(`PAYMENT_COMPLETED_${reward.invoiceId}`);
    }
    
    if (patients.length === 0) {
      return { success: true, rewardAmount: 0, error: 'No valid rewards to process' };
    }
    
    console.log(`🎁 [BlockchainService] Batch rewarding ${patients.length} patients...`);
    
    try {
      const contract = createDentiaRewardsContract();
      
      const tx = await contract.batchRewardPatients(
        patients,
        amounts,
        nonces,
        reasons
      );
      
      const receipt = await tx.wait(1);
      
      const totalReward = amounts.reduce((sum, a) => sum + a, 0n);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        rewardAmount: weiToDentia(totalReward),
      };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // READ FUNCTIONS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get patient's wallet information
   */
  public async getPatientWalletInfo(walletAddress: string): Promise<PatientWalletInfo | null> {
    if (!this.isReady() || !ethers.isAddress(walletAddress)) {
      return null;
    }
    
    try {
      const coinContract = createDentiaCoinContract();
      const rewardsContract = createDentiaRewardsContract();
      
      // Fetch data in parallel
      const [balance, hasReceived, allowanceData] = await Promise.all([
        coinContract.balanceOf(walletAddress),
        rewardsContract.hasReceivedRewards(walletAddress),
        rewardsContract.getRemainingDailyAllowance(walletAddress),
      ]);
      
      return {
        address: walletAddress,
        dentiaBalance: weiToDentia(balance),
        hasReceivedRewards: hasReceived,
        dailyAllowanceRemaining: weiToDentia(allowanceData.remainingAllowance),
        dailyResetTime: new Date(Number(allowanceData.resetTime) * 1000),
      };
      
    } catch (error: any) {
      console.error(`❌ [BlockchainService] Failed to get wallet info:`, error.message);
      return null;
    }
  }
  
  /**
   * Get treasury statistics
   */
  public async getTreasuryStats(): Promise<TreasuryStats | null> {
    if (!this.isReady()) return null;
    
    try {
      const contract = createDentiaRewardsContract();
      const stats = await contract.getStatistics();
      
      return {
        totalDistributed: weiToDentia(stats.totalDistributed),
        totalPatients: Number(stats.totalPatients),
        treasuryBalance: weiToDentia(stats.treasuryBalance),
        networkName: getCurrentNetwork().name,
        contractAddress: getContractAddresses().dentiaRewards,
      };
      
    } catch (error: any) {
      console.error(`❌ [BlockchainService] Failed to get treasury stats:`, error.message);
      return null;
    }
  }
  
  /**
   * Get operator wallet balance (for monitoring)
   */
  public async getOperatorBalance(): Promise<string> {
    if (!blockchainConfig.operatorPrivateKey) return '0';
    
    try {
      const provider = createProvider();
      const signer = createOperatorSigner();
      const balance = await provider.getBalance(signer.address);
      return ethers.formatEther(balance);
    } catch {
      return '0';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // TRANSACTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get pending transactions (for monitoring dashboard)
   */
  public getPendingTransactions(): BlockchainTransaction[] {
    return Array.from(this.pendingTransactions.values())
      .filter(tx => tx.status === 'PENDING');
  }
  
  /**
   * Get transaction history
   */
  public getTransactionHistory(limit: number = 100): BlockchainTransaction[] {
    return Array.from(this.pendingTransactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  /**
   * Clean up old transactions from memory
   */
  public cleanupOldTransactions(maxAgeHours: number = 24): void {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [id, tx] of this.pendingTransactions.entries()) {
      if (tx.createdAt.getTime() < cutoff && tx.status !== 'PENDING') {
        this.pendingTransactions.delete(id);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const blockchainService = BlockchainService.getInstance();

export default blockchainService;
