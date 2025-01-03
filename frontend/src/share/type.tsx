export enum Role {
  Owner = "Owner",
  Vet = "Vet",
}

export interface CountryOption {
  value: string;
  label: string;
}

export interface User {
  Id: string;
  FName: string;
  LName: string;
  Email: string;
  Location?: string;
  Role: Role;
  PetId?: string[];
  Avatar?: File | undefined;
}

export interface PetEvent {
  Id: string;
  Name: string;
  PetId?: string;
  DateTime: string;
  Duration: number;
  Location: string;
  CreatedBy: string;
  CreatedAt: string;
  VetAssigned: string;
  Type?: string;
  Status?: string;
  Description?: string;
  FollowUp?: string;
}

export interface Pet {
  Id: string;
  Name: string;
  Breed: string;
  Type: string;
  Age: number;
  Avatar?: string;
  Description?: string;
  Tag?: string;
  UserId: string;
}

export interface PetReminder {
  Id: string;
  PetId?: string;
  Name: string;
  DateTime: string;
  Description: string;
  FromVet?: boolean;
  Toggled?: boolean;
}
