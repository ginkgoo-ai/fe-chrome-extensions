import { IActionItemType, IProfileType } from "@/common/types/case";

const mock_url1 = "http://localhost:9002/#/home";
const mock_url2 = "https://www.baidu.com/";
const mock_url3 = "http://localhost:4100/";

const mock_localStorage = [
  {
    documentId: "68534920EDF2134CD75D7637A57E5CCF",
    result: [
      {
        storageKey: "key1",
        storageValue: "value1",
      },
      {
        storageKey: "key2",
        storageValue: "value2",
      },
    ],
  },
];

export const mock_chromeManager_executeScript_getLocalStorage = mock_localStorage;

export const mock_chromeManager_executeScript_queryHtmlInfo = "<html><body><h1>Hello, World!</h1></body></html>";

export const mock_chromeManager_createTab = mock_url2;

export const mock_chromeManager_queryTabInfo = mock_url2;

export const mock_pilotManager_profile: IProfileType = {
  id: {
    label: "ID",
    value: "343a978e-848d-4354-c16e-5cb2fe8f440b",
  },
  firstname: {
    label: "First name",
    value: "John",
  },
  lastname: {
    label: "Last name",
    value: "Doe",
  },
  email: {
    label: "Email",
    value: "ginkgo20250003@chefalicious.com",
  },
  dob: {
    label: "Date of birth",
    value: "1992-12-08",
  },
  gender: {
    label: "Gender",
    value: "Male",
  },
  relationshipStatus: {
    label: "Relationship status",
    value: "Single",
  },
  mobiletelephone: {
    label: "Mobile telephone",
    //     value: "+1 (415) 555-2671",       "14155552671"
    value: [
      {
        type: "countryCode",
        label: "Country Code",
        value: "1",
      },
      {
        type: "phoneNumber",
        label: "Phone number",
        value: "4155552671",
      },
    ],
  },
  visaType: {
    label: "Visa type",
    value: "Visit or transit visa",
  },
  address: {
    label: "Address",
    value: [
      {
        type: "country",
        label: "Country",
        value: "United States of America",
      },
      {
        hidden: true,
        type: "countryCode",
        label: "Country Code",
        value: "USA",
      },
      // {
      //   type: "postalCode",
      //   label: "Postal code",
      //   value: "12345",
      // },
      {
        type: "province",
        label: "Province/State",
        value: "California",
      },
      {
        type: "city",
        label: "City",
        value: "San Francisco",
      },
      {
        type: "addressLine1",
        label: "Address line 1",
        value: "123 Main St",
      },
      {
        type: "addressLine2",
        label: "Address line 2",
        value: "Apt 4B",
      },
      // {
      //   type: "addressLine3",
      //   label: "Address line 3",
      //   value: "Floor 2",
      // },
    ],
  },
  liveTime: {
    label: "Lived at this address",
    value: [
      {
        type: "timeLived",
        label: "Time Lived",
        value: "3",
      },
      {
        type: "timeLivedUnit",
        label: "Time Lived Unit",
        value: "years",
      },
    ],
  },
  liveOwnershipStatus: {
    label: "Ownership status",
    value: "Rent",
  },
};

export const mock_pilotManager_actionList: Record<string, { actions: IActionItemType[] }> = {
  "Skilled Worker visa": {
    actions: [
      {
        selector: "a[href='https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/skilled_worker_out_uk']",
        type: "click",
      },
      {
        selector: "a[href='/start/skilled-worker-ooc']",
        type: "click",
      },
    ],
  },
  "Apply from outside the UK": {
    actions: [
      {
        selector: "a[href='https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/sort/start/skilled_worker_out_uk']",
        type: "click",
      },
    ],
  },
  "Where are you planning to live?": {
    actions: [
      {
        selector: "input[id='out-of-crown-dependency']",
        type: "click",
      },
      {
        selector: "button[id='continue-button']",
        type: "click",
      },
    ],
  },
  "Do you have a current EU, EEA or Swiss passport?": {
    actions: [
      {
        selector: "input[id='not-eea-applicable']",
        type: "click",
      },
      {
        selector: "input[id='continue-button']",
        type: "click",
      },
    ],
  },
  "Your location": {
    actions: [
      {
        selector: "input[id='value_false']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Select your language": {
    actions: [
      {
        selector: "input[id='languageCode_en']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Confirm your visa type": {
    actions: [
      {
        selector: "input[id='visaType_visit-visa-ooc-standard']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Select a country to provide your biometrics": {
    actions: [
      {
        selector: "input[id='countryCode_ui']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "country")?.value || ""
          : "",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Check available visa application centre locations": {
    actions: [
      {
        selector: "input[id='vacAvailabilityConfirmed_true']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Apply for a UK visit visa": {
    actions: [
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Do you want to start a new application?": {
    actions: [
      {
        selector: "a[id='forceStart']",
        type: "click",
      },
    ],
  },
  "Register an email": {
    actions: [
      {
        selector: "input[id='email']",
        type: "input",
        value: mock_pilotManager_profile.email.value.toString(),
      },
      {
        selector: "input[id='password1']",
        type: "manual",
      },
      {
        selector: "input[id='password2']",
        type: "manual",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Contacting you by email": {
    actions: [
      {
        selector: "input[id='emailOwner_you']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Additional email": {
    actions: [
      {
        selector: "input[id='value_false']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Your telephone number": {
    actions: [
      {
        selector: "input[id='telephoneNumber']",
        type: "input",
        value:
          (Array.isArray(mock_pilotManager_profile.mobiletelephone.value)
            ? mock_pilotManager_profile.mobiletelephone.value.find((item) => item.type === "countryCode")?.value || ""
            : "") +
          (Array.isArray(mock_pilotManager_profile.mobiletelephone.value)
            ? mock_pilotManager_profile.mobiletelephone.value.find((item) => item.type === "phoneNumber")?.value || ""
            : ""),
      },
      {
        selector: "input[id='telephoneNumberPurpose_useInUK']",
        type: "click",
      },
      {
        selector: "input[id='telephoneNumberType_mobile']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Any other telephone numbers": {
    actions: [
      {
        selector: "input[id='addAnother_false']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Contacting you by telephone": {
    actions: [
      {
        selector: "input[id='contactByTelephone_callAndText']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Your name": {
    actions: [
      {
        selector: "input[id='givenName']",
        type: "input",
        value: mock_pilotManager_profile.firstname.value.toString(),
      },
      {
        selector: "input[id='familyName']",
        type: "input",
        value: mock_pilotManager_profile.lastname.value.toString(),
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Any other names": {
    actions: [
      {
        selector: "input[id='addAnother_false']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Your sex and relationship status": {
    actions: [
      {
        selector: "input[id='gender_1']",
        type: "click",
      },
      {
        selector: "select[id='relationshipStatus']",
        type: "input",
        value: "S",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "Your address": {
    actions: [
      {
        selector: "input[id='outOfCountryAddress_line1']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "addressLine1")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_line2']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "addressLine2")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_line3']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "addressLine3")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_townCity']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "city")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_province']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "province")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_postCode']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "postalCode")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_countryRef_ui']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.address.value)
          ? mock_pilotManager_profile.address.value.find((item) => item.type === "country")?.value || ""
          : "",
      },
      {
        selector: "input[id='isCorrespondenceAddress_true']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
  "About this property": {
    actions: [
      {
        selector: "select[id='timeLivedUnit']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.liveTime.value)
          ? mock_pilotManager_profile.liveTime.value.find((item) => item.type === "timeLivedUnit")?.value || ""
          : "",
      },
      {
        selector: "input[id='timeLived']",
        type: "input",
        value: Array.isArray(mock_pilotManager_profile.liveTime.value)
          ? mock_pilotManager_profile.liveTime.value.find((item) => item.type === "timeLived")?.value || ""
          : "",
      },
      {
        selector: "input[id='ownershipCategory_rent']",
        type: "click",
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
};

export default {
  mock_chromeManager_executeScript_getLocalStorage,
  mock_chromeManager_executeScript_queryHtmlInfo,
  mock_chromeManager_createTab,
  mock_chromeManager_queryTabInfo,
  mock_pilotManager_profile,
  mock_pilotManager_actionList,
};
