export interface SecretNode {
  secretID: string;
  secretName: string;
  providerID: string;
  providerName: string;
  createdAt: string;
}

export interface Link {
  fromSecret: string;
  toSecret: string;
  createdAt: string;
}

export interface LineageData {
  nodes: SecretNode[];
  links: Link[]
}