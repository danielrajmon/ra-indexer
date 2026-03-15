export interface File {
  md5: string;
  name: string;
  labels: string[];
  patchUrl: string;
  isRequired?: boolean | null;
  isOwned?: boolean;
}