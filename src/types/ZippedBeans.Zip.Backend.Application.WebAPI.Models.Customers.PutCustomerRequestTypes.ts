// PutCustomerRequest.ts

export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
}

export interface ContactInfo {
  email: string
  phoneNumber?: string
  preferredContactMethod?: 'email' | 'phone'
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary?: boolean
  addressType?: 'billing' | 'shipping' | 'other'
}

export interface PutCustomerRequest {
  personalInfo: PersonalInfo
  contactInfo: ContactInfo
  addresses: Address[]
  additionalEmailAddresses?: string[]
}