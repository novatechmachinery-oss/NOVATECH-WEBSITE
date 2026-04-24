"use client";

import { FormEvent, useState } from "react";
import { getCategoryOptions, getSubcategoryMap } from "@/lib/api";
import type { Machine, MachineFormValues } from "@/types/machine";

type MachineFormProps = {
  initialValues?: Machine | null;
  onSubmit: (values: MachineFormValues) => void;
};

const emptyValues: MachineFormValues = {
  name: "",
  brand: "",
  model: "",
  serialNumber: "",
  countryOfOrigin: "",
  price: 0,
  category: "Metal Working Machinery",
  subcategory: "CNC Machines",
  condition: "Used",
  stockStatus: "In Stock",
  machineType: "Industrial",
  description: "",
  specificationsText: "Power: 10kW, Capacity: 120 units/hr",
  imagesText: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7",
};

function toFormValues(machine?: Machine | null): MachineFormValues {
  if (!machine) {
    return { ...emptyValues };
  }

  return {
    name: machine.name,
    brand: machine.brand,
    model: machine.model,
    serialNumber: machine.serialNumber,
    countryOfOrigin: machine.countryOfOrigin,
    price: machine.price,
    category: machine.category,
    subcategory: machine.subcategory,
    condition: machine.condition,
    stockStatus: machine.stockStatus,
    machineType: machine.machineType,
    description: machine.description,
    specificationsText: machine.specifications
      .map((item) => `${item.key}: ${item.value}`)
      .join(", "),
    imagesText: machine.images.join(", "),
  };
}

export default function MachineForm({ initialValues, onSubmit }: MachineFormProps) {
  const [values, setValues] = useState<MachineFormValues>(toFormValues(initialValues));
  const categories = getCategoryOptions();
  const subcategoryMap = getSubcategoryMap();
  const subcategoryOptions = subcategoryMap[values.category] ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...values,
      subcategory: subcategoryOptions.includes(values.subcategory)
        ? values.subcategory
        : subcategoryOptions[0] ?? "",
    });
    if (!initialValues) {
      setValues({ ...emptyValues });
    }
  };

  return (
    <form className="machine-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Machine name</span>
          <input
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            required
          />
        </label>
        <label>
          <span>Brand</span>
          <input
            value={values.brand}
            onChange={(event) => setValues({ ...values, brand: event.target.value })}
            required
          />
        </label>
        <label>
          <span>Model</span>
          <input
            value={values.model}
            onChange={(event) => setValues({ ...values, model: event.target.value })}
            required
          />
        </label>
        <label>
          <span>Serial no</span>
          <input
            value={values.serialNumber}
            onChange={(event) => setValues({ ...values, serialNumber: event.target.value })}
            required
          />
        </label>
        <label>
          <span>Country of origin</span>
          <input
            value={values.countryOfOrigin}
            onChange={(event) => setValues({ ...values, countryOfOrigin: event.target.value })}
            required
          />
        </label>
        <label>
          <span>Price</span>
          <input
            type="number"
            min="0"
            value={values.price}
            onChange={(event) =>
              setValues({ ...values, price: Number(event.target.value) || 0 })
            }
            required
          />
        </label>
        <label>
          <span>Category</span>
          <select
            value={values.category}
            onChange={(event) =>
              setValues({
                ...values,
                category: event.target.value,
                subcategory: subcategoryMap[event.target.value]?.[0] ?? "",
              })
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Subcategory</span>
          <select
            value={values.subcategory}
            onChange={(event) => setValues({ ...values, subcategory: event.target.value })}
          >
            {subcategoryOptions.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Stock status</span>
          <select
            value={values.stockStatus}
            onChange={(event) => setValues({ ...values, stockStatus: event.target.value })}
          >
            <option value="In Stock">In Stock</option>
            <option value="Limited">Limited</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </label>
        <label>
          <span>Machine type</span>
          <select
            value={values.machineType}
            onChange={(event) => setValues({ ...values, machineType: event.target.value })}
          >
            <option value="Industrial">Industrial</option>
            <option value="Production Line">Production Line</option>
            <option value="Packaging">Packaging</option>
            <option value="Heavy Duty">Heavy Duty</option>
          </select>
        </label>
      </div>

      <label>
        <span>Description</span>
        <textarea
          rows={4}
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          required
        />
      </label>

      <label>
        <span>Specifications</span>
        <textarea
          rows={3}
          value={values.specificationsText}
          onChange={(event) => setValues({ ...values, specificationsText: event.target.value })}
          placeholder="Power: 10kW, Capacity: 120 units/hr"
          required
        />
      </label>

      <label>
        <span>Images</span>
        <textarea
          rows={3}
          value={values.imagesText}
          onChange={(event) => setValues({ ...values, imagesText: event.target.value })}
          placeholder="https://image-1.jpg, https://image-2.jpg"
          required
        />
      </label>

      <button type="submit" className="primary-button">
        {initialValues ? "Update machine" : "Add machine"}
      </button>
    </form>
  );
}
