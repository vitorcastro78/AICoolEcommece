
export interface PostCustomerRequest {
  currency: string;
  personalInfo?: PersonalInfo;
  contactInfo?: ContactInfo;
  addresses: Address[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface ContactInfo {
  email: string;
  phone?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type?: 'billing' | 'shipping' | 'other';
  isDefault?: boolean;
}
