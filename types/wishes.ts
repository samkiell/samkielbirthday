export const RELATIONSHIP_OPTIONS = [
  "Family",
  "Friend",
  "Colleague",
  "Fellow developer",
  "Other",
] as const;

export type RelationshipOption = (typeof RELATIONSHIP_OPTIONS)[number];

export interface WishResponse {
  id: string;
  code: string;
  name: string;
  message: string;
  relationship?: string;
  status: "approved" | "pending" | "hidden";
  createdAt: string;
}
