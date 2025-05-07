import { IActionItemType } from ".";

export interface IProfileItemType {
  label: string;
  value: string;
}

export interface IProfileType {
  id: IProfileItemType;
  firstname: IProfileItemType;
  lastname: IProfileItemType;
  email: IProfileItemType;
  dob: IProfileItemType;
  gender: IProfileItemType;
  mobiletelephone: IProfileItemType;
  address: IProfileItemType;
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
    value: "stale581@chefalicious.com",
  },
  dob: {
    label: "Date of birth",
    value: "1990-01-01",
  },
  gender: {
    label: "Gender",
    value: "male",
  },
  mobiletelephone: {
    label: "Mobile telephone",
    value: "14155552671", //     value: "+1 (415) 555-2671",
  },
  address: {
    label: "Address",
    value: "123 Main St, Anytown, USA",
  },
};

export const actionListMock: Record<string, { actions: IActionItemType[] }> = {
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
        value: profileMock.mobiletelephone.value,
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
        value: profileMock.firstname.value,
      },
      {
        selector: "input[id='familyName']",
        type: "input",
        value: profileMock.lastname.value,
      },
      {
        selector: "input[id='submit']",
        type: "click",
      },
    ],
  },
};
