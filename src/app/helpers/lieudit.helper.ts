import { Lieudit } from '../model/types/lieudit.model';
import { UILieudit } from "../models/lieudit.model";

export const buildLieuditFromUILieudit = (uiLieudit: UILieudit): Lieudit => {
  let lieudit: Lieudit = null;
  if (uiLieudit?.commune) {
    const { commune, ...lieuditAttributes } = uiLieudit;
    lieudit = {
      ...lieuditAttributes,
      communeId: commune.id
    };
  }

  return lieudit;
};
