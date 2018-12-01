export interface Document {
  delete(fn?: (err: any, product: this) => void): Promise<this>;
  restore();
}
