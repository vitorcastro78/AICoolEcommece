// PutCustomerRequestContact.ts

export interface PutCustomerRequestContact {
  email: string;
  phoneNumber: string;
  mobileNumber: string;
}

export type PutCustomerRequestContactValidation = {
  email: {
    required: boolean;
    pattern: RegExp;
  };
  phoneNumber: {
    required: boolean;
    pattern: RegExp;
  };
  mobileNumber: {
    required: boolean;
    pattern: RegExp;
  };
};

export const putCustomerRequestContactValidation: PutCustomerRequestContactValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phoneNumber: {
    required: false,
    pattern: /^\+?[0-9\s\-()]{7,}$/,
  },
  mobileNumber: {
    required: false,
    pattern: /^\+?[0-9\s\-()]{7,}$/,
  },
};