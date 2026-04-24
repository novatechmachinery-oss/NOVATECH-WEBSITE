import type {
  Lead,
  LeadStage,
  Machine,
  MachineFormValues,
  MachineSpecification,
  UserRecord,
} from "@/types/machine";

const STORAGE_KEY = "novatech-admin-machines";

const categories = [
  "Metal Working Machinery",
  "Plastic Machinery",
  "Textile Machinery",
  "Pharmaceutical Machinery",
];

const subcategoryMap: Record<string, string[]> = {
  "Metal Working Machinery": [
    "Heavy Duty Lathes",
    "Gear Hobbers",
    "Bending Machines",
    "Horizontal Machining Centres",
    "Turning and Milling Centres",
  ],
  "Plastic Machinery": ["Injection Moulding", "Blow Moulding", "Extrusion Lines"],
  "Textile Machinery": ["Weaving Machines", "Knitting Machines", "Dyeing Units"],
  "Pharmaceutical Machinery": ["Tablet Press", "Capsule Fillers", "Packaging Lines"],
};

const dummyMachines: Machine[] = [
  {
    id: "MCH-1001",
    name: "Heavy Duty CNC Slant Bed Lathe",
    brand: "Doosan",
    model: "Puma GT 2600",
    serialNumber: "SN-88342",
    countryOfOrigin: "South Korea",
    price: 92000,
    category: "Metal Working Machinery",
    subcategory: "Heavy Duty Lathes",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Rigid slant bed lathe for high accuracy turning in medium and heavy production.",
    specifications: [
      { key: "Swing", value: "660 mm" },
      { key: "Chuck", value: "10 inch" },
      { key: "Control", value: "Fanuc i Series" },
    ],
    images: ["https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7"],
  },
  {
    id: "MCH-1002",
    name: "CNC Gear Hobber",
    brand: "Pfauter",
    model: "PE 160",
    serialNumber: "SN-20455",
    countryOfOrigin: "Germany",
    price: 68000,
    category: "Metal Working Machinery",
    subcategory: "Gear Hobbers",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "Conventional",
    description: "Gear hobbing machine for repeatable cutting quality and production-grade reliability.",
    specifications: [
      { key: "Max Diameter", value: "160 mm" },
      { key: "Module", value: "6" },
      { key: "Voltage", value: "415V" },
    ],
    images: ["https://images.unsplash.com/photo-1581092918484-8313f4e2dd4e"],
  },
  {
    id: "MCH-1003",
    name: "UPETROM Heavy-Duty CNC Lathe",
    brand: "UPETROM",
    model: "UHD 40",
    serialNumber: "SN-45990",
    countryOfOrigin: "Romania",
    price: 78000,
    category: "Metal Working Machinery",
    subcategory: "Heavy Duty Lathes",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Heavy-duty turning solution built for large shaft and cylindrical components.",
    specifications: [
      { key: "Bed Length", value: "4000 mm" },
      { key: "Power", value: "22 kW" },
      { key: "Max Turning Dia", value: "800 mm" },
    ],
    images: ["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b"],
  },
  {
    id: "MCH-1004",
    name: "4 Rolls Hydraulic Plate Bender",
    brand: "Faccin",
    model: "4HEL 1264",
    serialNumber: "SN-77122",
    countryOfOrigin: "Italy",
    price: 126000,
    category: "Metal Working Machinery",
    subcategory: "Bending Machines",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Four-roll plate rolling machine for precise bending in fabrication lines.",
    specifications: [
      { key: "Rolling Width", value: "3100 mm" },
      { key: "Thickness", value: "25 mm" },
      { key: "Hydraulic", value: "Yes" },
    ],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
  },
  {
    id: "MCH-1005",
    name: "Horizontal Machining Centre",
    brand: "Doosan",
    model: "HM 500",
    serialNumber: "SN-12001",
    countryOfOrigin: "South Korea",
    price: 112000,
    category: "Metal Working Machinery",
    subcategory: "Horizontal Machining Centres",
    condition: "Used",
    stockStatus: "Limited",
    machineType: "CNC",
    description: "Horizontal machining centre suited for continuous multi-face machining operations.",
    specifications: [
      { key: "Pallet Size", value: "500 x 500" },
      { key: "Tool Capacity", value: "60" },
      { key: "Spindle", value: "12000 rpm" },
    ],
    images: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952"],
  },
  {
    id: "MCH-1006",
    name: "CNC Turning and Milling Center",
    brand: "DMG Gildemeister",
    model: "CTX Beta 1250",
    serialNumber: "SN-45003",
    countryOfOrigin: "Germany",
    price: 143000,
    category: "Metal Working Machinery",
    subcategory: "Turning and Milling Centres",
    condition: "Refurbished",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Combined turning and milling center for complex part production with reduced setups.",
    specifications: [
      { key: "Axis", value: "5 Axis" },
      { key: "Chuck", value: "12 inch" },
      { key: "Controller", value: "Siemens" },
    ],
    images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72"],
  },
];

const dummyLeads: Lead[] = [
  {
    id: "LEAD-1",
    name: "Manjunatha",
    company: "Manjunatha Swamy Engineering Services",
    interestedIn: "Gear Hobber WMW Modul ZFWZ 1250/1500",
    stage: "New",
  },
  {
    id: "LEAD-2",
    name: "Gurdev Singh",
    company: "RC Engineering",
    interestedIn: "GEAR HOBBER WMW MODUL ZFWZ 6300",
    stage: "New",
  },
  {
    id: "LEAD-3",
    name: "Adeel Khan",
    company: "Khan Fabrication Works",
    interestedIn: "4 Rolls Hydraulic Plate Bender",
    stage: "Contacted",
  },
];

const dummyUsers: UserRecord[] = [
  {
    id: "USR-1",
    name: "Admin Novatech Machinery",
    phone: "+91 9646255855",
    role: "Super Admin",
    joined: "2026-04-06",
  },
  {
    id: "USR-2",
    name: "Sales Manager",
    phone: "+91 9090909090",
    role: "Sales",
    joined: "2026-04-11",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

function parseSpecifications(specificationsText: string): MachineSpecification[] {
  return specificationsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [key, ...valueParts] = item.split(":");
      return {
        key: key?.trim() || "Specification",
        value: valueParts.join(":").trim() || "-",
      };
    });
}

function parseImages(imagesText: string) {
  return imagesText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildMachine(values: MachineFormValues, id?: string): Machine {
  return {
    id: id ?? `MCH-${Math.floor(Date.now() / 10)}`,
    name: values.name,
    brand: values.brand,
    model: values.model,
    serialNumber: values.serialNumber,
    countryOfOrigin: values.countryOfOrigin,
    price: values.price,
    category: values.category,
    subcategory: values.subcategory,
    condition: values.condition,
    stockStatus: values.stockStatus,
    machineType: values.machineType,
    description: values.description,
    specifications: parseSpecifications(values.specificationsText),
    images: parseImages(values.imagesText),
  };
}

export function getMachines() {
  if (!canUseStorage()) {
    return dummyMachines;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return dummyMachines;
  }

  try {
    return JSON.parse(raw) as Machine[];
  } catch {
    return dummyMachines;
  }
}

function setMachines(machines: Machine[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
  }

  return machines;
}

export function seedMachines(force = false) {
  const current = getMachines();
  if (!force && current.length > 0) {
    if (canUseStorage() && !window.localStorage.getItem(STORAGE_KEY)) {
      return setMachines(dummyMachines);
    }
    return current;
  }

  return setMachines(dummyMachines);
}

export function createMachine(values: MachineFormValues) {
  return setMachines([buildMachine(values), ...getMachines()]);
}

export function updateMachine(id: string, values: MachineFormValues) {
  return setMachines(
    getMachines().map((machine) => (machine.id === id ? buildMachine(values, id) : machine)),
  );
}

export function deleteMachine(id: string) {
  return setMachines(getMachines().filter((machine) => machine.id !== id));
}

export function getCategoryOptions() {
  return categories;
}

export function getSubcategoryMap() {
  return subcategoryMap;
}

export function getLeads() {
  return dummyLeads;
}

export function getUsers() {
  return dummyUsers;
}

export function getLeadStageCount(stage: LeadStage) {
  return dummyLeads.filter((lead) => lead.stage === stage).length;
}

export function getMachineStats() {
  const machines = getMachines();

  return {
    totalMachines: machines.length,
    availableMachines: machines.filter((machine) => machine.stockStatus === "In Stock").length,
    reservedMachines: machines.filter((machine) => machine.stockStatus === "Limited").length,
    totalLeads: dummyLeads.length,
    newToday: dummyLeads.filter((lead) => lead.stage === "New").length,
    dealsWon: dummyLeads.filter((lead) => lead.stage === "Won").length,
    totalCategories: categories.length,
    totalSubcategories: Object.values(subcategoryMap).flat().length,
  };
}

export function getLeadPipeline() {
  const stages: LeadStage[] = ["New", "Contacted", "Quotation", "Negotiation", "Won", "Lost"];
  return stages.map((stage) => ({
    stage,
    count: getLeadStageCount(stage),
  }));
}
