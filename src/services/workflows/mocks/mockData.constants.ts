/**
 * Mock data constants for workflow generators
 */

export const GENERATOR_TYPES = [
  'Password',
  'AWSIAMKey',
  'BasicAuth',
  'PostgreSQL',
  'SSH',
  'RabbitMQ'
] as const;

export const GENERATOR_STATUSES = [
  'Ready',
  'Error',
  'Pending'
] as const;

export const MOCK_NETWORK_DELAY_MS = 800;

export const MOCK_ENABLED = true;