import { LieuditCommon } from '../model/types/lieudit-common.model';
import { UICommune } from "./commune.model";

export interface UILieudit extends LieuditCommon {
  commune: UICommune;
}
