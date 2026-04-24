export type MachineSpecification = {
  key: string;
  value: string;
};

export type Machine = {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  countryOfOrigin: string;
  price: number;
  category: string;
  subcategory: string;
  condition: string;
  stockStatus: string;
  machineType: string;
  description: string;
  specifications: MachineSpecification[];
  images: string[];
};

export type MachineFormValues = {
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  countryOfOrigin: string;
  price: number;
  category: string;
  subcategory: string;
  condition: string;
  stockStatus: string;
  machineType: string;
  description: string;
  specificationsText: string;
  imagesText: string;
};

export type LeadStage = "New" | "Contacted" | "Quotation" | "Negotiation" | "Won" | "Lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  interestedIn: string;
  stage: LeadStage;
};

export type UserRecord = {
  id: string;
  name: string;
  phone: string;
  role: string;
  joined: string;
};
