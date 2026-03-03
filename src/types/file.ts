export interface File {
  md5: string;
  name: string;
  labels: string[];
  patchUrl: string;
  isOwned?: boolean;
}