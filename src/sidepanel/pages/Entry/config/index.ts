import { StepProps } from "antd";

export enum StatusEnum {
  START = "START",
  QUERY = "QUERY",
  ANALYSIS = "ANALYSIS",
  ACTION = "ACTION",
  WAIT = "WAIT",
  STOP = "STOP",
}

export type ActionResultType = "success" | "notFound" | "";

export interface IActionItemType {
  selector: string;
  type: "input" | "click";
  value?: string;
  actionresult?: ActionResultType;
  actiontimestamp?: string;
}

export interface IStepActionType {
  actioncurrent?: number;
  actionresult?: "success" | "error";
  actiontimestamp?: string;
  actionlist?: IActionItemType[];
}

export interface IStepItemType extends StepProps {
  actioncurrent: number;
  actionlist: IActionItemType[];
}

export const stepListMap: {
  title: string;
  support?: Record<string, string>[];
  actions?: IActionItemType[];
}[] = [
  {
    title: "Exited",
    support: [{ href: "https://visas-immigration.service.gov.uk/exited" }],
    actions: [],
  },
  {
    title: "Sign Out",
    support: [
      {
        href: "https://visas-immigration.service.gov.uk/expired",
        selector_0: `main#content section.intro p span.block`,
      },
    ],
    actions: [
      {
        selector: `a[class="button"][href^="/resume"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Sign In",
    support: [
      {
        href: "https://visas-immigration.service.gov.uk/",
        selector_0: `input[id="password"][type="password"][name="password"]`,
        selector_1: `input[id="submit"][type="submit"][name="submit"]`,
      },
    ],
    actions: [
      {
        selector: `input[id="password"][type="password"][name="password"]`,
        type: "input",
        value: "test_password",
      },
      {
        selector: `input[id="noElement"]`,
        type: "input",
        value: "no element",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application Applicant",
    support: [
      { href: "https://visas-immigration.service.gov.uk/", selector_0: `a[class="button"][role="button"][href="/edit/application.0"]` },
    ],
    actions: [
      {
        selector: `a[class="button"][role="button"][href="/edit/application.0"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application CurrentAddressFiveYears",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: `#currentAddressFiveYears` }],
    actions: [
      {
        selector: `#currentAddressFiveYears input[id="value_true"][type="radio"]`,
        type: "click",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application CitizenshipCeremony",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#citizenshipCeremony" }],
    actions: [
      {
        selector: `#citizenshipCeremony select[id="ceremonyCouncil"]`,
        type: "input",
        value: "CORP_CITY_OF_LONDON",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application StandardGenderRelationship",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#standardGenderRelationship" }],
    actions: [
      {
        selector: `#standardGenderRelationship input[id="gender_1"]`,
        type: "click",
      },
      {
        selector: `#standardGenderRelationship select[id="relationshipStatus"]`,
        type: "input",
        value: "S",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application StandardNationalityDOB",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#standardNationalityDOB" }],
    actions: [
      {
        selector: `#standardNationalityDOB input[id="nationality_ui"]`,
        type: "input",
        value: "Uganda",
      },
      {
        selector: `#standardNationalityDOB input[id="countryOfBirth_ui"]`,
        type: "input",
        value: "Algeria",
      },
      {
        selector: `#standardNationalityDOB input[id="placeOfBirth"]`,
        type: "input",
        value: "London",
      },
      {
        selector: `#standardNationalityDOB input[id="dob_day"]`,
        type: "input",
        value: "22",
      },
      {
        selector: `#standardNationalityDOB input[id="dob_month"]`,
        type: "input",
        value: "3",
      },
      {
        selector: `#standardNationalityDOB input[id="dob_year"]`,
        type: "input",
        value: "2020",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application Your passport",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#standardPassport" }],
    actions: [
      {
        selector: `#standardPassport input[id="hasValidPassport_false"][type="radio"]`,
        type: "click",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application Reason for not providing your passport",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#noPassportReason_field" }],
    actions: [
      {
        selector: `#noPassportReason_field input[id="noPassportReason_lostStolen"][type="radio"]`,
        type: "click",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  {
    title: "Application Lost or stolen passport",
    support: [{ href: "https://visas-immigration.service.gov.uk/", selector_0: "#standardLostStolenPassport" }],
    actions: [
      {
        selector: `#standardLostStolenPassport textarea[id="howWasDocumentStolen"]`,
        type: "input",
        value: "I lost it",
      },
      {
        selector: `input[id="submit"][type="submit"][name="submit"]`,
        type: "click",
      },
    ],
  },
  { title: "Documents", support: [] },
  { title: "Declaration", support: [] },
  { title: "Pay", support: [] },
  { title: "Further actions", support: [] },
];

// use for mock
// const updateStepListCurrent = async (root: Parse5Node) => {
//   if (!refTabActivated.current) {
//     return;
//   }

//   const { url } = refTabActivated.current || {};
//   let stepListCurrentReal = -1;

//   for (let i = 0; i < stepListMap.length; i++) {
//     const item = stepListMap[i];
//     if (!item.support) continue;

//     let isMatch = false;
//     for (const rule of item.support) {
//       let ruleMatch = true;

//       for (const key of Object.keys(rule)) {
//         if (key === "href") {
//           ruleMatch = ruleMatch && url?.includes(rule[key]);
//         } else if (key.startsWith("selector_")) {
//           const resQuerySelector = await ChromeManager.executeScript(refTabActivated.current, {
//             cbName: "querySelector",
//             cbParams: {
//               selector: rule[key],
//             },
//           });
//           ruleMatch = ruleMatch && !!resQuerySelector?.[0]?.result;
//         } else {
//           ruleMatch = false;
//         }
//       }

//       if (ruleMatch) {
//         isMatch = true;
//         break;
//       }
//     }

//     if (isMatch) {
//       stepListCurrentReal = i;
//       break;
//     }
//   }

//   console.log("updateStepListCurrent stepListCurrentReal", stepListCurrentReal, stepListMap?.[stepListCurrentReal]);

//   if (stepListCurrentReal < 0) {
//     message.open({ type: "error", content: MESSAGE.NO_MATCH_STEP });
//     setStatus("stop");
//     return;
//   }

//   const actions = stepListMap[stepListCurrentReal]?.actions || [];

//   setStepListCurrent(stepListCurrentReal);
//   updateStepListItems({
//     stepcurrent: stepListCurrentReal,
//     actioncurrent: 0,
//     actionlist: actions,
//   });

//   for (let i = 0; i < actions.length; i++) {
//     const action = actions[i];
//     const resActionDom = await ChromeManager.executeScript(refTabActivated.current, {
//       cbName: "actionDom",
//       cbParams: {
//         action,
//       },
//     });
//     const { type } = resActionDom?.[0]?.result || {};

//     updateStepListItems({
//       stepcurrent: stepListCurrentReal,
//       actioncurrent: i,
//       actionresult: type,
//       actiontimestamp: dayjs().format("YYYY-MM-DD HH:mm:ss:SSS"),
//     });
//   }
// };
