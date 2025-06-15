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
