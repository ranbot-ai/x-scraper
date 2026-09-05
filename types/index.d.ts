export interface IIdentifier {
  identifier: string;
}

export interface IQueueItem {
  tries: number;
  identifier: Identifier;
}

export interface IConfig {
  name: string;
  myip_url: string;
  endpoint: string;
  user_agent: string;
  headless: boolean;
  devtools: boolean;
  timeout: number;
  ignore_resource_types: string[];
  concurrency: number;
  max_tries: number;
  internal_usernames: string[];
  scrape_following: boolean;
}

export interface IZProxy {
  enabled: boolean;
  username: string;
  password: string;
  port: number;
  host: string;
  bypass_domains: string[];
}

export interface ICookie {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export interface IFollowingUser {
  username: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  verified?: boolean;
  followersCount?: number;
}

export interface ICompanyInfo {
  name?: string;
  pictureUrl?: string;
  website?: string | null;
  professionalCategory?: string;
  dateCreated?: string;
  description?: string;
  joinedDate?: string;
  location?: string;
  following?: string;
  followers?: string;
  followingList?: IFollowingUser[];
  rawData?: any;
}
