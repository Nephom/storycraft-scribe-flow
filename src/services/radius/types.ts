
export interface RadiusSettings {
  serverUrl: string;
  serverPort: number;
  sharedSecret: string;
  adminUsers: string[];
  isConfigured: boolean;
  setupDate: string;
}

export interface RadiusUser {
  username: string;
  password: string;
}
