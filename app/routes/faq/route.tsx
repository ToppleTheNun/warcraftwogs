import type { HeadersFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import {
  cacheControl,
  eTag,
  expires,
  lastModified,
  serverTiming,
  setCookie,
} from "~/constants";

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const loaderCache = loaderHeaders.get(cacheControl);

  const headers: HeadersInit = {
    [cacheControl]: loaderCache ?? "public",
  };

  const expiresDate = loaderHeaders.get(expires);

  if (expiresDate) {
    // gets overwritten by cacheControl if present anyways
    headers.Expires = expiresDate;
  }

  const lastModifiedDate = loaderHeaders.get(lastModified);

  if (lastModifiedDate) {
    headers[lastModified] = lastModifiedDate;
  }

  const maybeETag = loaderHeaders.get(eTag);

  if (maybeETag) {
    headers[eTag] = maybeETag;
  }

  const maybeSetCookie = loaderHeaders.get(setCookie);

  if (maybeSetCookie) {
    headers[setCookie] = maybeSetCookie;
  }

  const serverTimings = loaderHeaders.get(serverTiming);

  if (serverTimings) {
    headers[serverTiming] = serverTimings;
  }

  return headers;
};

export default function FrequentlyAskedQuestions(): JSX.Element {
  return (
    <>
      <Header
        headerChildren={
          <Link to="/" className="font-medium text-white hover:underline">
            Back to Leaderboard
          </Link>
        }
      />
      <main className="container mt-4 flex max-w-screen-2xl flex-1 flex-col space-y-4 px-4 md:mx-auto 2xl:px-0">
        <h1 className="text-3xl font-bold text-white">
          Frequently Asked Questions
        </h1>
        <article className="prose prose-invert">
          <h2>What is Word of Glory?</h2>
          <p>
            ⚔️🛡️ So, you want to know about WoG-ing your hog, huh? Well, let me
            weave you a tale, as old as Azeroth itself, about the healing magic
            that can turn the tide of any battle. 🧙‍♂️
          </p>

          <p>
            ⛑️ When your hog's health is dwindling, when they're just a breath
            away from meeting the spirit healer, that's when you swoop in,
            paladin, with your Word of Glory (WoG). It's not just a spell; it's
            a lifeline, a beacon of hope in the darkest dungeons of Azeroth. 🌟
          </p>

          <p>
            🔥 But WoG-ing your hog? It's a sacred bond, a vow between a paladin
            and their teammate, a promise that says, "Not on my watch, buddy."
            You're not just restoring hit points; you're rebuffing death itself.
            Your hog, inches from defeat, now stands strong, ready to fight, all
            thanks to the Word of Glory.🔥
          </p>

          <p>
            ⚔️ Each time you cast it, you're not just playing a game; you're
            living a legend. The legend of the paladin, the savior, the one who
            WoGs their hogs, turning the tide of the battle when all seems lost.
            Your comrades look to you, their beacon in the swirling chaos of
            battle.⚔️
          </p>

          <p>
            💪 You stand firm, your Light shining in the shadows, WoG-ing your
            hogs and leading your team to victory. The triumphant rush of a
            dungeon well cleared, the gratitude of your comrades – that, my
            friend, is the true Word of Glory. 💪
          </p>

          <p>
            ⚔️ So hold your head high, paladin. You are the bastion against the
            darkness, the healer of hogs. Your Word of Glory is your bond, your
            promise, your duty. You are the light in the dark, and every hog you
            heal carries your glory forward. ⚔️
          </p>

          <p>
            🙌 May your Light never dim, and your hogs never fall. Keep WoG-ing,
            paladin. Azeroth depends on it. 🙌
          </p>
        </article>
        <article className="prose prose-invert">
          <h2>No, seriously, what is Word of Glory?</h2>
          <p>
            🛡️⚔️ Ah, the saga of WoG-ing the hog! Prepare yourself, adventurer,
            for a tale woven from the very heart of Azeroth, filled with valor,
            and the indomitable spirit of a Paladin. ⚔️🛡️
          </p>

          <p>
            💥 In the tumultuous throes of dungeon delirium, when your hog
            teeters on the brink of oblivion, life hanging by a silken thread,
            you heed the call. A Paladin's heart never falters, and with the
            divine Word of Glory (WoG), you rebuke the darkness. 💥
          </p>

          <p>
            🔮 WoG-ing the hog is no casual incantation, it's a manifestation of
            your unyielding faith, a pledge between you and your hog. It
            whispers, "Fear not, for you shall not falter under my watch". That
            WoG is not a spell, it's an anthem, a hymn to resilience and
            resurgence. 🔮
          </p>

          <p>
            🔥 As the divine light pours forth, wrapping your hog in its warm
            embrace, the world stands still. The sinister chill of the dungeon
            is repelled by your radiant beacon, hit points rejuvenating with a
            vigor that would make even the Naaru jealous. Yes, that's the power
            of WoG-ing your hog. 🔥
          </p>

          <p>
            🗡️ As the battle rages on, your hog stands resolute, strengthened by
            your divine intervention. Each WoG is a defiant cry against the
            encroaching darkness, a testament to the enduring bonds of
            fellowship. 🗡️
          </p>

          <p>
            💫 Each time you cast that divine word, you're not just a Paladin
            playing a game, you're a beacon, a lifeline, a testament to courage.
            WoG-ing your hog isn't a mere action, it's a doctrine, an echo of
            the very Light that guides you. 💫
          </p>

          <p>
            👑 So stand tall, Paladin, with your head held high. Let your Light
            shine on every corner of Azeroth, healing, safeguarding, WoG-ing
            your hogs. Each battle won, every dungeon cleared, they're not just
            victories, they're tales of your legend, etched forever in the
            annals of time. 👑
          </p>

          <p>
            💖 For you are the Paladin, the WoG-er of hogs, the light amidst the
            darkness. Long may your Word of Glory resound, and long may your
            hogs thrive. For in Azeroth, you're not just a hero, you're a
            savior. 💖
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
