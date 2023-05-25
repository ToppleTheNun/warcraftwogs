import { z } from "zod";

export const playerDetailSpecSchema = z.object({
  spec: z.string(),
  count: z.number(),
});
export type PlayerDetailSpec = z.infer<typeof playerDetailSpecSchema>;

export const playerDetailSchema = z.object({
  name: z.string(),
  id: z.number(),
  guid: z.number(),
  // this is the player's class
  type: z.string(),
  server: z.string(),
});
export type PlayerDetail = z.infer<typeof playerDetailSchema>;

export const playerDetailsArraySchema = z.array(playerDetailSchema);
export type PlayerDetailArray = z.infer<typeof playerDetailsArraySchema>;

export const playerDetailsDpsHealerTankSchema = z.object({
  dps: playerDetailsArraySchema.default([]),
  healers: playerDetailsArraySchema.default([]),
  tanks: playerDetailsArraySchema.default([]),
});
export type PlayerDetailsDpsHealerTank = z.infer<
  typeof playerDetailsDpsHealerTankSchema
>;

export const wordOfGloryHealEventSchema = z.object({
  timestamp: z.number(),
  type: z.literal("heal"),
  sourceID: z.number(),
  targetID: z.number(),
  abilityGameID: z.literal(85673),
  fight: z.number(),
  buffs: z.string(),
  hitType: z.number(),
  amount: z.number(),
  overheal: z.number().default(0),
});
export type WordOfGloryHealEvent = z.infer<typeof wordOfGloryHealEventSchema>;

export const wordOfGloryHealEventArraySchema = z.array(
  wordOfGloryHealEventSchema
);
export type WordOfGloryHealEventArray = z.infer<
  typeof wordOfGloryHealEventArraySchema
>;
