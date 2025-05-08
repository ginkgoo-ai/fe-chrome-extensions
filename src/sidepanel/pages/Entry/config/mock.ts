import { IActionItemType } from ".";

export interface IAddressItemType {
  hidden?: boolean;
  type: string;
  label: string;
  value: string;
}

export interface IProfileItemType {
  label: string;
  value: string | IAddressItemType[];
}

export interface IProfileType {
  [key: string]: IProfileItemType;
}

export const profileMock: IProfileType = {
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
    value: "ginkgo20250002@chefalicious.com",
  },
  dob: {
    label: "Date of birth",
    value: "1992-12-08",
  },
  gender: {
    label: "Gender",
    value: "male",
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
  visaType: {
    label: "Visa type",
    value: "Visit or transit visa",
  },
};

export const actionListMock: Record<string, { actions: IActionItemType[] }> = {
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
        selector: "select[id='countryCode']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "countryCode")?.value || ""
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
  "Register an email": {
    actions: [
      {
        selector: "input[id='email']",
        type: "input",
        value: profileMock.email.value.toString(),
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
          (Array.isArray(profileMock.mobiletelephone.value)
            ? profileMock.mobiletelephone.value.find((item) => item.type === "countryCode")?.value || ""
            : "") +
          (Array.isArray(profileMock.mobiletelephone.value)
            ? profileMock.mobiletelephone.value.find((item) => item.type === "phoneNumber")?.value || ""
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
        value: profileMock.firstname.value.toString(),
      },
      {
        selector: "input[id='familyName']",
        type: "input",
        value: profileMock.lastname.value.toString(),
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
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "addressLine1")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_line2']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "addressLine2")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_line3']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "addressLine3")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_townCity']",
        type: "input",
        value: Array.isArray(profileMock.address.value) ? profileMock.address.value.find((item) => item.type === "city")?.value || "" : "",
      },
      {
        selector: "input[id='outOfCountryAddress_province']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "province")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_postCode']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "postalCode")?.value || ""
          : "",
      },
      {
        selector: "input[id='outOfCountryAddress_countryRef_ui']",
        type: "input",
        value: Array.isArray(profileMock.address.value)
          ? profileMock.address.value.find((item) => item.type === "country")?.value || ""
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
};
