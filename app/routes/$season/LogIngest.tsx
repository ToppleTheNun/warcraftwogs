import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useNavigation } from "@remix-run/react";
import type { NavigationStates } from "@remix-run/router";
import clsx from "clsx";
import { z } from "zod";

import { loadLeaderboardEntriesForReport } from "~/load.server";
import {
  createWordOfGlory,
  getMinimumAmountOfHealing,
  getMinimumAmountOfOverhealing,
  getMinimumAmountOfTotalHealing,
} from "~/models/wordOfGlory.server";
import { Spinner } from "~/routes/$season/Spinner";
import { linkClassName } from "~/routes/$season/tokens";
import type { Timings } from "~/timing.server";
import { getServerTimeHeader } from "~/timing.server";
import { getReportCode } from "~/utils";

const serverTiming = "Server-Timing";

const schema = z.object({
  warcraftLogsCode: z
    .string()
    .url()
    .startsWith("https://www.warcraftlogs.com/reports/")
    .refine(
      (link) => getReportCode(link),
      (link) => ({ message: `${link} does not have a valid report code` })
    )
    .transform((link) => getReportCode(link)),
});

const parseLogIngestionForm = (formData: FormData) =>
  parse(formData, {
    schema,
    acceptMultipleErrors: () => true,
  });

export const action = async ({ request }: DataFunctionArgs) => {
  const timings: Timings = {};

  const formData = await request.clone().formData();

  const submission = parseLogIngestionForm(formData);

  if (!submission.value || submission.intent !== "submit") {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const warcraftLogsCode = submission.value.warcraftLogsCode;
  if (!warcraftLogsCode) {
    console.error("!warcraftLogsCode");
    return json({ status: "error", submission } as const, { status: 400 });
  }

  // const { region, entries } = await loadLeaderboardEntriesForReport(
  //   warcraftLogsCode,
  //   timings
  // );
  // if (!region) {
  //   console.error("!region");
  //   return json({ status: "error", submission } as const, { status: 400 });
  // }
  //
  // const amountOfParsesToCheckAgainst = 50;
  // const regionHealMinimumResult = await getMinimumAmountOfHealing(
  //   amountOfParsesToCheckAgainst,
  //   region,
  //   timings
  // );
  // const regionHealMinimum = regionHealMinimumResult._min.heal ?? 0;
  // const regionOverhealMinimumResult = await getMinimumAmountOfOverhealing(
  //   amountOfParsesToCheckAgainst,
  //   region,
  //   timings
  // );
  // const regionOverhealMinimum = regionOverhealMinimumResult._min.overheal ?? 0;
  // const regionTotalHealMinimumResult = await getMinimumAmountOfTotalHealing(
  //   amountOfParsesToCheckAgainst,
  //   region,
  //   timings
  // );
  // const regionTotalHealMinimum =
  //   regionTotalHealMinimumResult._min.totalHeal ?? 0;
  //
  // console.log(
  //   `Required healing to be recorded: ${regionHealMinimum}/${regionOverhealMinimum}/${regionTotalHealMinimum}`
  // );
  // const entriesThatPassTheBar = entries.filter(
  //   (entry) =>
  //     entry.heal >= regionHealMinimum ||
  //     entry.overheal >= regionOverhealMinimum ||
  //     entry.totalHeal >= regionTotalHealMinimum
  // );
  //
  // await Promise.all(
  //   entriesThatPassTheBar.map((entry) => createWordOfGlory(entry, timings))
  // );
  //
  // console.log(
  //   `Ingested ${entriesThatPassTheBar.length}/${entries.length} WoG events`
  // );

  return json(
    { status: "success", submission },
    {
      headers: {
        [serverTiming]: getServerTimeHeader(timings),
      },
    }
  );
};

const getSubmitButtonClassName = (
  disabled: boolean,
  navigationState: NavigationStates[keyof NavigationStates]["state"]
) => {
  const base = linkClassName.replace("flex", "");
  const disabledBase = linkClassName
    .replace("flex", "")
    .replace("bg-gray-700", "bg-gray-800")
    .replace(
      "hover:bg-gray-500",
      `${
        navigationState === "loading" ? "cursor-wait" : "cursor-not-allowed"
      } grayscale`
    );

  return disabled ? disabledBase : base;
};

export const LogIngest = () => {
  const logIngestFetcher = useFetcher<typeof action>();

  const [form, { warcraftLogsCode }] = useForm({
    id: "log-ingest",
    constraint: getFieldsetConstraint(schema),
    lastSubmission: logIngestFetcher.data?.submission,
    shouldRevalidate: "onBlur",
    onValidate: ({ formData }) => {
      return parseLogIngestionForm(formData);
    },
  });
  const { state: navigationState } = useNavigation();

  const disabled = navigationState !== "idle";

  return (
    <>
      <Form
        method="POST"
        name="log-ingestion"
        className="flex flex-col space-y-2 px-4 md:flex-row md:place-items-center md:space-x-2 md:space-y-0 md:px-0 md:pt-0"
        {...form.props}
      >
        <fieldset
          disabled={disabled}
          className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0"
        >
          <label htmlFor={warcraftLogsCode.id}>WarcraftLogs Link</label>
          <input
            className={clsx(
              "rounded-md text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6",
              {
                "border-2 border-red-500": warcraftLogsCode.error,
                "border-0 ring-1 ring-inset ring-gray-300":
                  !warcraftLogsCode.error,
              }
            )}
            placeholder="https://www.warcraftlogs.com/reports/..."
            {...conform.input(warcraftLogsCode)}
          />
        </fieldset>
        <button
          className={getSubmitButtonClassName(disabled, navigationState)}
          type="submit"
        >
          Submit
        </button>
        {navigationState !== "idle" ? <Spinner /> : null}
      </Form>
      {warcraftLogsCode.error ? (
        <div
          className="text-red-500"
          id={warcraftLogsCode.errorId}
          role="alert"
        >
          {warcraftLogsCode.error}
        </div>
      ) : null}
    </>
  );
};
