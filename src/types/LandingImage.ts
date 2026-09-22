export interface LandingImage {
  id: string;
  imageUrl: string;
  caption: string;
  linkUrl: string | null;
  displayOrder: number;
  active: boolean;
  /** Also show this one as a dismissible popup banner on page load (once per browser session), in addition to appearing in the gallery. */
  showAsPopup: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export type LandingImageInput = Omit<LandingImage, "id" | "createdAt" | "updatedAt">;
