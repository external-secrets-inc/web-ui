import { AuditMetric, AuditTimelineEntry, AuditSecretTableData } from "@/components/Audit/Audit.interfaces";
import { MOCK_PROVIDERS, MOCK_SECRET_NAMES } from "./mockData.constants";

// Random number but seeded for consistent mock data
export const seededRandom = (date: string): number => {
  let seed = Array.from(date).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const generateMockTimelineData = (startDate: Date | string, endDate: Date | string, baseStats: AuditMetric[]): AuditTimelineEntry[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    return {
      date: dateStr,
      stats: baseStats.map(stat => ({
        ...stat,
        amount: stat.amount - Math.floor(seededRandom(dateStr + stat.kind) * (stat.amount * 0.2))
      }))
    };
  });
};

/**
 * Generates a specified number of mock secrets with realistic data
 * @param count Number of secrets to generate
 * @returns Array of mock secrets
 */
export const generateMockSecrets = (count: number): AuditSecretTableData[] => {
  return Array.from({ length: count }, (_, index) => {
    const provider = MOCK_PROVIDERS[Math.floor(Math.random() * MOCK_PROVIDERS.length)];
    const name = MOCK_SECRET_NAMES[Math.floor(Math.random() * MOCK_SECRET_NAMES.length)];
    const hasRotation = Math.random() > 0.3;
    const lastRotation = hasRotation
      ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const lastAccess = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    const policiesAmount = Math.floor(Math.random() * 5);
    const compliantPoliciesAmount = Math.floor(Math.random() * (policiesAmount + 1));
    const duplicatesAmount = Math.floor(Math.random() * 3);
    const accessorsAmount = Math.floor(Math.random() * 5) + 1;

    return {
      id: `secret-${index + 1}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${index + 1} - ${name}`,
      provider: provider.id,
      providerName: provider.name,
      lastRotation,
      compliantPoliciesAmount,
      policiesAmount,
      fullCompliant: compliantPoliciesAmount === policiesAmount,
      duplicatesAmount,
      lastAccess,
      accessorsAmount,
    };
  });
};