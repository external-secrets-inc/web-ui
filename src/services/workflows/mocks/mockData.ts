/**
 * Mock data for workflow generators
 */

import type { UISchema } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { GeneratorTableData, GeneratorType } from "@/components/workflows/Generators/Generators.interfaces";
import { GENERATOR_TYPES } from './mockData.constants';

/**
 * Mock generator table data for listing generators
 */
export const mockGenerators: GeneratorTableData[] = [
  {
    name: "aws-iam-credentials",
    namespace: "default",
    kind: "AWSIAMKey",
    status: {
      status: "Ready",
      reason: "GeneratorReady"
    }
  },
  {
    name: "postgres-user-generator",
    namespace: "default",
    kind: "PostgreSQL",
    status: {
      status: "Ready",
      reason: "GeneratorReady"
    }
  },
  {
    name: "basic-auth-gen",
    namespace: "production",
    kind: "BasicAuth",
    status: {
      status: "Error",
      reason: "ConfigurationError"
    }
  },
  {
    name: "ssh-key-generator",
    namespace: "development",
    kind: "SSH",
    status: {
      status: "Ready",
      reason: "GeneratorReady"
    }
  },
  {
    name: "password-gen",
    namespace: "default",
    kind: "Password",
    status: {
      status: "Ready",
      reason: "GeneratorReady"
    }
  },
  {
    name: "rabbitmq-credentials",
    namespace: "messaging",
    kind: "RabbitMQ",
    status: {
      status: "Ready",
      reason: "GeneratorReady"
    }
  }
];

/**
 * Mock generator types for the generator creation dropdown
 */
export const mockGeneratorTypes: GeneratorType[] = GENERATOR_TYPES.map(type => ({
  name: type,
  description: `Generate ${type.toLowerCase()} credentials and configurations`
}));

/**
 * Option sets for different generator types
 */
export const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
];

export const POSTGRESQL_PRIVILEGES = [
  { value: "SELECT", label: "Read Only (SELECT)" },
  { value: "INSERT", label: "Insert Only" },
  { value: "UPDATE", label: "Update Only" },
  { value: "DELETE", label: "Delete Only" },
  { value: "ALL", label: "All Privileges" },
  { value: "CONNECT", label: "Connect Only" },
  { value: "CREATE", label: "Create Objects" },
];

export const SSH_KEY_TYPES = [
  { value: "rsa", label: "RSA" },
  { value: "ed25519", label: "Ed25519" },
  { value: "ecdsa", label: "ECDSA" },
];

export const SSH_KEY_SIZES = [
  { value: "2048", label: "2048 bits" },
  { value: "3072", label: "3072 bits" },
  { value: "4096", label: "4096 bits" },
];

export const SSH_PRIVATE_KEY_FORMATS = [
  { value: "PEM", label: "PEM Format" },
  { value: "OpenSSH", label: "OpenSSH Format" },
  { value: "PKCS8", label: "PKCS#8 Format" },
];

export const RABBITMQ_USER_TAGS = [
  { value: "administrator", label: "Administrator" },
  { value: "monitoring", label: "Monitoring" },
  { value: "policymaker", label: "Policy Maker" },
  { value: "management", label: "Management" },
  { value: "impersonator", label: "Impersonator" },
];

// Legacy option arrays - keeping for backwards compatibility
const awsRegionOptions = AWS_REGIONS;

/**
 * Reusable generator status options
 */
export const GENERATOR_STATUSES: string[] = [
  "Active",
  "Inactive",
  "Pending",
  "Error",
  "Updating"
];

/**
 * Base generator UI schema fields used across all generator types
 */
const baseGeneratorFields = [
  {
    id: "metadata.name",
    label: "Name",
    type: "text" as const,
    required: true,
    description: "Name of the generator resource"
  },
  {
    id: "metadata.namespace",
    label: "Namespace",
    type: "text" as const,
    required: true,
    description: "Namespace where the generator will be created"
  }
];

/**
 * Generator UI Schemas following standard Kubernetes structure
 * Each schema includes metadata and spec sections similar to secretstore.yaml
 */
export const GENERATOR_UI_SCHEMAS: Record<string, UISchema> = {
  "aws-iam": {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "AWS IAM User Generator specification.",
        fields: [
          {
            id: "spec.auth",
            label: "Authentication",
            type: "object",
            required: true,
            description: "AWS authentication configuration.",
            fields: [
              {
                id: "spec.auth.region",
                label: "AWS Region",
                type: "select",
                required: true,
                description: "AWS region where the IAM user will be created.",
                options: awsRegionOptions,
              },
              {
                id: "spec.auth.accessKeyId",
                label: "Access Key ID",
                type: "secret-selector",
                required: true,
                description: "Reference to AWS Access Key ID in a Secret.",
              },
              {
                id: "spec.auth.secretAccessKey",
                label: "Secret Access Key",
                type: "secret-selector",
                required: true,
                description: "Reference to AWS Secret Access Key in a Secret.",
              },
            ],
          },
          {
            id: "spec.userConfig",
            label: "User Configuration",
            type: "object",
            required: true,
            description: "Configuration for the IAM user to be created.",
            fields: [
              {
                id: "spec.userConfig.usernamePath",
                label: "Username Path",
                type: "text",
                required: false,
                description: "Path for the IAM user (e.g., /service-accounts/).",
                default: "/",
              },
              {
                id: "spec.userConfig.permissionsBoundary",
                label: "Permissions Boundary",
                type: "text",
                required: false,
                description: "ARN of the permissions boundary to attach to the user.",
              },
              {
                id: "spec.userConfig.tags",
                label: "Tags",
                type: "key-value",
                required: false,
                description: "Tags to apply to the created IAM user.",
              },
            ],
          },
          {
            id: "spec.policy",
            label: "IAM Policy",
            type: "object",
            required: true,
            description: "Policy configuration for the IAM user.",
            fields: [
              {
                id: "spec.policy.policyArns",
                label: "Policy ARNs",
                type: "array",
                required: false,
                description: "List of existing policy ARNs to attach to the user.",
                fields: [
                  {
                    id: "spec.policy.policyArns.items",
                    label: "Policy ARN",
                    type: "text",
                    required: false,
                    description: "AWS Policy ARN (e.g., arn:aws:iam::aws:policy/ReadOnlyAccess).",
                  },
                ],
              },
              {
                id: "spec.policy.inlinePolicy",
                label: "Inline Policy",
                type: "textarea",
                required: false,
                description: "JSON policy document to attach inline to the user.",
              },
            ],
          },
        ],
      },
    ],
  },

  postgresql: {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "PostgreSQL user generator specification.",
        fields: [
          {
            id: "spec.connection",
            label: "Database Connection",
            type: "object",
            required: true,
            description: "PostgreSQL database connection configuration.",
            fields: [
              {
                id: "spec.connection.host",
                label: "Host",
                type: "text",
                required: true,
                description: "PostgreSQL server hostname or IP address.",
              },
              {
                id: "spec.connection.port",
                label: "Port",
                type: "number",
                required: false,
                description: "PostgreSQL server port number.",
                default: 5432,
              },
              {
                id: "spec.connection.database",
                label: "Database",
                type: "text",
                required: true,
                description: "Name of the PostgreSQL database.",
              },
              {
                id: "spec.connection.adminUser",
                label: "Admin Username",
                type: "secret-selector",
                required: true,
                description: "Reference to admin username in a Secret.",
              },
              {
                id: "spec.connection.adminPassword",
                label: "Admin Password",
                type: "secret-selector",
                required: true,
                description: "Reference to admin password in a Secret.",
              },
            ],
          },
          {
            id: "spec.userConfig",
            label: "User Configuration",
            type: "object",
            required: true,
            description: "Configuration for the PostgreSQL user to be created.",
            fields: [
              {
                id: "spec.userConfig.privileges",
                label: "Privileges",
                type: "select",
                required: true,
                description: "Database privileges to grant to the user.",
                options: POSTGRESQL_PRIVILEGES,
              },
              {
                id: "spec.userConfig.schemas",
                label: "Schemas",
                type: "array",
                required: false,
                description: "List of schemas to grant access to.",
                fields: [
                  {
                    id: "spec.userConfig.schemas.items",
                    label: "Schema Name",
                    type: "text",
                    required: false,
                    description: "Name of the database schema.",
                  },
                ],
              },
              {
                id: "spec.userConfig.tables",
                label: "Tables",
                type: "array",
                required: false,
                description: "List of specific tables to grant access to.",
                fields: [
                  {
                    id: "spec.userConfig.tables.items",
                    label: "Table Name",
                    type: "text",
                    required: false,
                    description: "Name of the database table.",
                  },
                ],
              },
            ],
          },
          {
            id: "spec.passwordConfig",
            label: "Password Configuration",
            type: "object",
            required: false,
            description: "Configuration for generated password.",
            fields: [
              {
                id: "spec.passwordConfig.length",
                label: "Password Length",
                type: "number",
                required: false,
                description: "Length of the generated password.",
                default: 16,
              },
              {
                id: "spec.passwordConfig.includeSymbols",
                label: "Include Symbols",
                type: "checkbox",
                required: false,
                description: "Include special characters in the password.",
                default: true,
              },
            ],
          },
        ],
      },
    ],
  },

  ssh: {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "SSH key pair generator specification.",
        fields: [
          {
            id: "spec.keyConfig",
            label: "Key Configuration",
            type: "object",
            required: true,
            description: "SSH key generation configuration.",
            fields: [
              {
                id: "spec.keyConfig.keyType",
                label: "Key Type",
                type: "select",
                required: true,
                description: "Type of SSH key to generate.",
                options: SSH_KEY_TYPES,
              },
              {
                id: "spec.keyConfig.keySize",
                label: "Key Size",
                type: "select",
                required: false,
                description: "Size of the SSH key in bits.",
                options: SSH_KEY_SIZES,
              },
              {
                id: "spec.keyConfig.comment",
                label: "Comment",
                type: "text",
                required: false,
                description: "Comment to add to the SSH public key.",
              },
            ],
          },
          {
            id: "spec.outputFormat",
            label: "Output Format",
            type: "object",
            required: false,
            description: "Format configuration for the generated SSH keys.",
            fields: [
              {
                id: "spec.outputFormat.privateKeyFormat",
                label: "Private Key Format",
                type: "select",
                required: false,
                description: "Format for the private key output.",
                options: SSH_PRIVATE_KEY_FORMATS,
                default: "PEM",
              },
              {
                id: "spec.outputFormat.includePublicKey",
                label: "Include Public Key",
                type: "checkbox",
                required: false,
                description: "Include the public key in the generated secret.",
                default: true,
              },
            ],
          },
        ],
      },
    ],
  },

  rabbitmq: {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "RabbitMQ user generator specification.",
        fields: [
          {
            id: "spec.connection",
            label: "RabbitMQ Connection",
            type: "object",
            required: true,
            description: "RabbitMQ server connection configuration.",
            fields: [
              {
                id: "spec.connection.host",
                label: "Host",
                type: "text",
                required: true,
                description: "RabbitMQ server hostname or IP address.",
              },
              {
                id: "spec.connection.port",
                label: "Port",
                type: "number",
                required: false,
                description: "RabbitMQ management API port.",
                default: 15672,
              },
              {
                id: "spec.connection.vhost",
                label: "Virtual Host",
                type: "text",
                required: false,
                description: "RabbitMQ virtual host.",
                default: "/",
              },
              {
                id: "spec.connection.adminUser",
                label: "Admin Username",
                type: "secret-selector",
                required: true,
                description: "Reference to admin username in a Secret.",
              },
              {
                id: "spec.connection.adminPassword",
                label: "Admin Password",
                type: "secret-selector",
                required: true,
                description: "Reference to admin password in a Secret.",
              },
            ],
          },
          {
            id: "spec.userConfig",
            label: "User Configuration",
            type: "object",
            required: true,
            description: "Configuration for the RabbitMQ user to be created.",
            fields: [
              {
                id: "spec.userConfig.tags",
                label: "User Tags",
                type: "array",
                required: false,
                description: "RabbitMQ user tags (roles).",
                fields: [
                  {
                    id: "spec.userConfig.tags.items",
                    label: "Tag",
                    type: "select",
                    required: false,
                    description: "RabbitMQ user tag.",
                    options: RABBITMQ_USER_TAGS,
                  },
                ],
              },
              {
                id: "spec.userConfig.permissions",
                label: "Permissions",
                type: "object",
                required: false,
                description: "User permissions configuration.",
                fields: [
                  {
                    id: "spec.userConfig.permissions.configure",
                    label: "Configure Pattern",
                    type: "text",
                    required: false,
                    description: "Regex pattern for configure permissions.",
                    default: ".*",
                  },
                  {
                    id: "spec.userConfig.permissions.write",
                    label: "Write Pattern",
                    type: "text",
                    required: false,
                    description: "Regex pattern for write permissions.",
                    default: ".*",
                  },
                  {
                    id: "spec.userConfig.permissions.read",
                    label: "Read Pattern",
                    type: "text",
                    required: false,
                    description: "Regex pattern for read permissions.",
                    default: ".*",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  "basic-auth": {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "Basic authentication credentials generator specification.",
        fields: [
          {
            id: "spec.usernameConfig",
            label: "Username Configuration",
            type: "object",
            required: true,
            description: "Configuration for username generation.",
            fields: [
              {
                id: "spec.usernameConfig.prefix",
                label: "Username Prefix",
                type: "text",
                required: false,
                description: "Prefix to add to generated username.",
              },
              {
                id: "spec.usernameConfig.suffix",
                label: "Username Suffix",
                type: "text",
                required: false,
                description: "Suffix to add to generated username.",
              },
              {
                id: "spec.usernameConfig.length",
                label: "Random Length",
                type: "number",
                required: false,
                description: "Length of random part of username.",
                default: 8,
              },
            ],
          },
          {
            id: "spec.passwordConfig",
            label: "Password Configuration",
            type: "object",
            required: true,
            description: "Configuration for password generation.",
            fields: [
              {
                id: "spec.passwordConfig.length",
                label: "Password Length",
                type: "number",
                required: false,
                description: "Length of the generated password.",
                default: 16,
              },
              {
                id: "spec.passwordConfig.includeUppercase",
                label: "Include Uppercase",
                type: "checkbox",
                required: false,
                description: "Include uppercase letters in password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeLowercase",
                label: "Include Lowercase",
                type: "checkbox",
                required: false,
                description: "Include lowercase letters in password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeNumbers",
                label: "Include Numbers",
                type: "checkbox",
                required: false,
                description: "Include numbers in password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeSymbols",
                label: "Include Symbols",
                type: "checkbox",
                required: false,
                description: "Include special characters in password.",
                default: true,
              },
            ],
          },
        ],
      },
    ],
  },

  password: {
    fields: [
      {
        id: "metadata",
        label: "Metadata",
        type: "object",
        required: true,
        description: "Metadata of the resource.",
        fields: [
          {
            id: "metadata.labels",
            label: "Labels",
            type: "key-value",
            required: false,
            description: "A map of string keys and values that can be used to organize and categorize resources.",
          },
          {
            id: "metadata.name",
            label: "Name",
            type: "text",
            required: true,
            description: "Name of the resource. Must be unique.",
          },
        ],
      },
      {
        id: "spec",
        label: "Spec",
        type: "object",
        required: true,
        description: "Password generator specification.",
        fields: [
          {
            id: "spec.passwordConfig",
            label: "Password Configuration",
            type: "object",
            required: true,
            description: "Configuration for password generation.",
            fields: [
              {
                id: "spec.passwordConfig.length",
                label: "Password Length",
                type: "number",
                required: true,
                description: "Length of the generated password.",
                default: 16,
                minimum: 4,
                maximum: 128,
              },
              {
                id: "spec.passwordConfig.includeUppercase",
                label: "Include Uppercase Letters",
                type: "checkbox",
                required: false,
                description: "Include uppercase letters (A-Z) in the password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeLowercase",
                label: "Include Lowercase Letters",
                type: "checkbox",
                required: false,
                description: "Include lowercase letters (a-z) in the password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeNumbers",
                label: "Include Numbers",
                type: "checkbox",
                required: false,
                description: "Include numbers (0-9) in the password.",
                default: true,
              },
              {
                id: "spec.passwordConfig.includeSymbols",
                label: "Include Symbols",
                type: "checkbox",
                required: false,
                description: "Include special characters (!@#$%^&*) in the password.",
                default: false,
              },
              {
                id: "spec.passwordConfig.excludeAmbiguous",
                label: "Exclude Ambiguous Characters",
                type: "checkbox",
                required: false,
                description: "Exclude ambiguous characters (0, O, l, I, etc.) to improve readability.",
                default: false,
              },
              {
                id: "spec.passwordConfig.customCharset",
                label: "Custom Character Set",
                type: "text",
                required: false,
                description: "Custom set of characters to use for password generation. Overrides other character options if provided.",
              },
            ],
          },
          {
            id: "spec.outputConfig",
            label: "Output Configuration",
            type: "object",
            required: false,
            description: "Configuration for password output format.",
            fields: [
              {
                id: "spec.outputConfig.encoding",
                label: "Encoding",
                type: "select",
                required: false,
                description: "Output encoding for the generated password.",
                options: [
                  { value: "plain", label: "Plain Text" },
                  { value: "base64", label: "Base64" },
                  { value: "hex", label: "Hexadecimal" },
                ],
                default: "plain",
              },
              {
                id: "spec.outputConfig.format",
                label: "Output Format",
                type: "select",
                required: false,
                description: "Format template for the password output.",
                options: [
                  { value: "password", label: "Password Only" },
                  { value: "json", label: "JSON Object" },
                  { value: "yaml", label: "YAML Format" },
                ],
                default: "password",
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * UI Schema for generator types selection
 * This is used when fetching the schema for "generators" resource type
 * It provides a select field with all available generator types
 */
export const GENERATOR_TYPES_UI_SCHEMA: UISchema = {
  fields: [
    {
      id: "generatorType",
      label: "Generator Type",
      type: "select",
      required: true,
      description: "Choose the type of generator you want to create. This will determine the available configuration options.",
      options: GENERATOR_TYPES.map(type => type.toLowerCase())
    }
  ]
};

/**
 * Gets a UI schema for a specific generator type
 */
export const getMockGeneratorUISchema = (generatorType: string): UISchema => {
  // Special case: if requesting "generators" (without specific type), return the type selector
  if (generatorType === "generators") {
    return GENERATOR_TYPES_UI_SCHEMA;
  }

  const schema = GENERATOR_UI_SCHEMAS[generatorType.toLowerCase()];

  if (schema) {
    return schema;
  }

  // Return generic schema for unknown types
  return {
    fields: [
      ...baseGeneratorFields,
      {
        id: "spec.config",
        label: "Configuration",
        type: "key-value",
        required: false,
        description: `Configuration options for ${generatorType} generator`
      }
    ]
  };
};