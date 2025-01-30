export interface ServerOptions {
  proxyPort?: number;
  adminPort?: number;
  storagePath?: string;
}

export interface Server {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}
