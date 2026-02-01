import { PrismaClient, InventoryCategory, StockAlertLevel, InventoryItem } from '@prisma/client';

const prisma = new PrismaClient();

// Constants based on consumption patterns
const CONSUMPTION_PATTERNS: Record<InventoryCategory, number> = {
  [InventoryCategory.FOOD]: 0.15,        // High consumption
  [InventoryCategory.HYGIENE]: 0.10,     // Moderate
  [InventoryCategory.CLEANING]: 0.08,    // Steady
  [InventoryCategory.PEDAGOGICAL]: 0.02, // Low
  [InventoryCategory.MEDICINE]: 0.01,    // Occasional
  [InventoryCategory.DIGNITY_CRITICAL]: 0.20, // Very High priority
  // Fix: Added missing keys to satisfy TypeScript Record type
  [InventoryCategory.OFFICE]: 0.03,
  [InventoryCategory.UTILITY]: 0.05
};

// Thresholds for alert levels (days remaining)
const ALERT_THRESHOLDS = {
  CRITICAL: 5,  // Less than 5 days
  LOW: 15,      // Less than 15 days
  WARNING: 30   // Less than 30 days
};

export interface StockPrediction {
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  currentQuantity: number;
  avgDailyConsumption: number;
  daysRemaining: number;
  alertLevel: StockAlertLevel;
  recommendedOrder: number;
  urgency: StockAlertLevel;
}

export class StockPredictionService {
  
  /**
   * Calculate stock predictions for a specific school
   */
  async predictStockNeeds(schoolId: string): Promise<StockPrediction[]> {
    const items = await prisma.inventoryItem.findMany({
      where: { schoolId }
    });

    const predictions: StockPrediction[] = items.map(item => {
      // Calculate Days Remaining
      // Avoid division by zero
      const consumption = item.avgDailyConsumption > 0 
        ? item.avgDailyConsumption 
        : this.estimateConsumption(item);
      
      const daysRemaining = consumption > 0 
        ? item.quantity / consumption 
        : 999; // Infinite if no consumption

      // Determine Alert Level
      let alertLevel: StockAlertLevel = StockAlertLevel.NONE;
      let urgency: StockAlertLevel = StockAlertLevel.OK;

      if (daysRemaining <= ALERT_THRESHOLDS.CRITICAL) {
        alertLevel = StockAlertLevel.CRITICAL;
        urgency = StockAlertLevel.EMERGENCY;
      } else if (daysRemaining <= ALERT_THRESHOLDS.LOW) {
        alertLevel = StockAlertLevel.LOW;
        urgency = StockAlertLevel.LOW; // Map LOW to LOW
      }

      // Calculate Recommended Order (to cover 30 days + safety stock)
      const safetyStock = consumption * 5; // 5 days safety
      const targetStock = consumption * 30; // 30 days coverage
      const recommendedOrder = Math.max(0, targetStock + safetyStock - item.quantity);

      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        currentQuantity: item.quantity,
        avgDailyConsumption: consumption,
        daysRemaining: Math.round(daysRemaining),
        alertLevel,
        recommendedOrder: Math.ceil(recommendedOrder),
        urgency
      };
    });

    // Filter only items that need attention (Low or Critical)
    return predictions.filter(p => p.alertLevel !== StockAlertLevel.NONE);
  }

  /**
   * Recalculate average consumption based on actual logs
   */
  async recalculateConsumption(itemId: string): Promise<void> {
    const logs = await prisma.consumptionLog.findMany({
      where: { 
        itemId,
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      }
    });

    if (logs.length === 0) return;

    const totalConsumed = logs.reduce((acc, log) => acc + log.quantity, 0);
    const avg = totalConsumed / 30;

    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { 
        avgDailyConsumption: avg,
        lastUpdated: new Date()
      }
    });
  }

  /**
   * Fallback estimation if no logs exist
   */
  private estimateConsumption(item: InventoryItem): number {
    const factor = CONSUMPTION_PATTERNS[item.category] || 0.05;
    // Estimate: 5% of total stock per day is a rough heuristic for active items
    return item.quantity * factor; 
  }
}
