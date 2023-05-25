import { wordOfGloryHealEventSchema } from "~/wcl/schemas";

const example = {
  "timestamp": 339166,
  "type": "heal",
  "sourceID": 18,
  "targetID": 17,
  "abilityGameID": 85673,
  "fight": 1,
  "buffs": "404996.139.77489.385127.287280.",
  "hitType": 1,
  "amount": 202450
};

const wordOfGloryHealEvent = wordOfGloryHealEventSchema.parse(example);
console.log(wordOfGloryHealEvent);
