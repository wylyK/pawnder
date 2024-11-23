export enum Role {
  Owner = 'owner',
  Vet = 'vet',
}

export interface CountryOption {
  value: string;
  label: string;
}

export interface User {
  Id: string
  FName: string
  LName: string
  Email: string
  Location: string
  Role: Role
  PetId: string[]
  Avatar: string
}
