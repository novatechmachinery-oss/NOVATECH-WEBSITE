import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[^#=]+=/.test(line))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/g, "");
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function clean(value) {
  return (value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/["]+$/g, "");
}

function normalizeBrand(value) {
  return clean(value || "Unknown Brand")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const canonicalBrandNames = new Map([
  ["skoda", "Skoda"],
  ["deckel maho", "Deckel Maho"],
  ["tos hol monta", "TOS Holmonta"],
  ["tos holmonta", "TOS Holmonta"],
  ["gleason pfauter", "Gleason Pfauter"],
  ["mori seiki", "Mori Seiki"],
  ["wmw modul", "WMW-Modul"],
]);

function canonicalBrand(value) {
  return canonicalBrandNames.get(normalizeBrand(value)) || clean(value || "Unknown Brand");
}

function modelValue(machine) {
  return clean(machine.model) || "[model not filled]";
}

const response = await fetch(
  `${url}/rest/v1/machines?select=id,name,brand,model,stock_status,created_at&order=created_at.desc&limit=5000`,
  {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  },
);

const body = await response.text();
if (!response.ok) {
  throw new Error(`Supabase request failed (${response.status}): ${body}`);
}

const machines = JSON.parse(body);
const groups = new Map();

for (const machine of machines) {
  const key = normalizeBrand(machine.brand);
  const brand = canonicalBrand(machine.brand);

  if (!groups.has(key)) {
    groups.set(key, {
      brand,
      count: 0,
      models: new Map(),
    });
  }

  const group = groups.get(key);
  group.count += 1;

  const model = modelValue(machine);
  const modelKey = model.toLowerCase();
  if (!group.models.has(modelKey)) {
    group.models.set(modelKey, { model, count: 0 });
  }
  group.models.get(modelKey).count += 1;
}

const sortedGroups = [...groups.values()].sort((left, right) =>
  left.brand.localeCompare(right.brand),
);

console.log(`Total machines: ${machines.length}`);
console.log(`Total grouped brands: ${sortedGroups.length}`);
console.log("");

for (const group of sortedGroups) {
  const models = [...group.models.values()]
    .sort((left, right) => left.model.localeCompare(right.model))
    .map((model) => `${model.model}${model.count > 1 ? ` x${model.count}` : ""}`)
    .join(", ");

  console.log(`${group.brand} (${group.count} machines): ${models}`);
}
