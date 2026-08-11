"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgePercent,
  Bolt,
  Bot,
  Boxes,
  Cable,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsDown,
  CircleDashed,
  CircleDollarSign,
  CircleDot,
  CircleHelp,
  Cog,
  Construction,
  CornerDownRight,
  Cpu,
  Cylinder,
  Disc3,
  Download,
  Drill,
  Factory,
  Fan,
  Flame,
  FlaskConical,
  Hammer,
  KeyRound,
  Layers3,
  Maximize2,
  MessageCircle,
  Minus,
  MoveHorizontal,
  PackageOpen,
  PanelLeftOpen,
  PanelsTopLeft,
  Phone,
  Pill,
  RotateCw,
  Ruler,
  Scale,
  ScanLine,
  Search,
  Settings2,
  Shapes,
  Shirt,
  SlidersHorizontal,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { MachineCategory, MachineItem } from "@/lib/machines";
import { REQUEST_PRICE_WHATSAPP_HREF, WHATSAPP_HREF } from "@/lib/whatsapp";
import { contactDetails } from "@/lib/contact-details";
const sidebarCategoryIconMap: Record<string, LucideIcon> = {
  "Bar Machinery": Minus,
  "Bending Machines": CornerDownRight,
  "Bolt & Fasteners Machines": Bolt,
  "Broaching Machinery & Keyseaters": KeyRound,
  "CNC Machines": Cpu,
  "Drilling Machinery": Drill,
  "EDM Machines": Zap,
  "Forging & Foundry Machinery": Hammer,
  "Gear Machinery": Cog,
  Grinders: Disc3,
  "Honing Machines": CircleDot,
  "Horizontal Boring Mills": MoveHorizontal,
  "Industrial Plants": Factory,
  "Inspection & Measuring Machines": Ruler,
  "Laser Cutting Machines": ScanLine,
  "Lathes & Turning Machines": RotateCw,
  "Machining Centres": Boxes,
  "Milling Machines": Settings2,
  "Other Equipment": PackageOpen,
  "Pharmaceutical Machinery": Pill,
  "Plastic Machinery": FlaskConical,
  "Power Plants & Turbines": Fan,
  Presses: ChevronsDown,
  Robots: Bot,
  "Roll Formers & Rolling Mills": Waves,
  Saws: Construction,
  "Sheet Metal Machinery": PanelsTopLeft,
  "Special Deals": BadgePercent,
  "Textile Machinery": Shirt,
  "Thread Milling": CircleDashed,
  "Tube and Pipe Machinery": Cylinder,
  Uncategorized: CircleHelp,
  Various: Shapes,
  "Veling Equipment": Scale,
  "Vertical Turning Lathes": Layers3,
  "Welding Equipment": Flame,
  "Wire Machinery": Cable,
};

function GridMachineCard({ m, onClick }: { m: MachineItem; onClick: () => void }) {
  const imageList = useMemo(
    () => (m.images && m.images.length > 0 ? m.images : [m.imageSrc]),
    [m.images, m.imageSrc],
  );
  const activeImageIndex = 0;
  const activePosition = m.imagePositions?.[activeImageIndex] ?? m.imagePosition ?? "center";

  return (
    <button suppressHydrationWarning
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[0.55rem] border border-slate-200 bg-white text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_18px_34px_rgba(20,91,147,0.12)] active:translate-y-0"
    >
      <div className="relative h-[168px] w-full overflow-hidden bg-slate-100 sm:h-[205px] md:h-[220px] lg:h-[235px]">
        <Image
          src={imageList[activeImageIndex]}
          alt={m.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          loading="lazy"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          style={{ objectPosition: activePosition }}
        />
        {imageList.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/40 px-2.5 py-1 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            {imageList.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeImageIndex ? "w-3 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 p-2.5 text-center sm:p-3.5">
        <p className="text-[0.64rem] font-black uppercase tracking-[0.1em] text-[#145b93] [overflow-wrap:anywhere] sm:text-[0.72rem] sm:tracking-[0.12em]">
          {m.machineType.toUpperCase()}
          {m.subcategory ? ` - ${m.subcategory.toUpperCase()}` : ` - ${m.category.toUpperCase()}`}
        </p>
        <h2 className="mt-1.5 min-h-[2.35rem] text-[0.9rem] font-black uppercase leading-[1.18] text-slate-950 [overflow-wrap:anywhere] sm:line-clamp-2 sm:min-h-[2.7rem] sm:text-[1rem] sm:leading-[1.28]">
          {m.title}
        </h2>
        {m.location ? (
          <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-slate-400 sm:text-sm">
            {m.location}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function formatMachinePdfFileName(machine: MachineItem) {
  return machine.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat(".pdf");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfText(value: string, maxChars = 78) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function base64ToUint8Array(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function convertImageToJpegData(
  src: string,
  fallbackTitle: string,
): Promise<{ bytes: Uint8Array; width: number; height: number; caption: string } | null> {
  try {
    const response = await fetch(src, { cache: "force-cache" });
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      const image = new window.Image();
      image.decoding = "async";

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image load failed"));
        image.src = objectUrl;
      });

      const maxWidth = 1200;
      const scale = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        return null;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
      const base64 = dataUrl.split(",")[1];

      if (!base64) {
        return null;
      }

      return {
        bytes: base64ToUint8Array(base64),
        width,
        height,
        caption: fallbackTitle,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

function buildMachinePdf({
  fileName,
  title,
  machineType,
  brand,
  model,
  category,
  subcategory,
  descriptionLines,
  images,
  headerLogo,
}: {
  fileName: string;
  title: string;
  machineType: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  descriptionLines: string[];
  images: Array<{ bytes: Uint8Array; width: number; height: number; caption: string }>;
  headerLogo: { bytes: Uint8Array; width: number; height: number; caption: string } | null;
}) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const objects: Uint8Array[] = [];
  const offsets: number[] = [];
  let objectCount = 0;

  function pushObject(content: string | Uint8Array) {
    objectCount += 1;
    const header = new TextEncoder().encode(`${objectCount} 0 obj\n`);
    const footer = new TextEncoder().encode(`\nendobj\n`);
    const body = typeof content === "string" ? new TextEncoder().encode(content) : content;
    const combined = new Uint8Array(header.length + body.length + footer.length);
    combined.set(header, 0);
    combined.set(body, header.length);
    combined.set(footer, header.length + body.length);
    objects.push(combined);
    return objectCount;
  }

  function streamObject(stream: string, extraDict = "") {
    const encoded = new TextEncoder().encode(stream);
    return pushObject(`<< /Length ${encoded.length}${extraDict} >>\nstream\n${stream}\nendstream`);
  }

  const embeddedImages = [...(headerLogo ? [headerLogo] : []), ...images];
  const imageObjectIds = embeddedImages.map((image) => {
    const header = new TextEncoder().encode(
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
    );
    const footer = new TextEncoder().encode(`\nendstream`);
    const stream = new Uint8Array(header.length + image.bytes.length + footer.length);
    stream.set(header, 0);
    stream.set(image.bytes, header.length);
    stream.set(footer, header.length + image.bytes.length);
    return pushObject(stream);
  });

  const fontObjectId = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontObjectId = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  function addTextLine(
    commands: string[],
    text: string,
    x: number,
    y: number,
    size: number,
    font: "F1" | "F2",
    color: [number, number, number],
  ) {
    commands.push("BT");
    commands.push(`/${font} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg ${x} ${y} Td (${escapePdfText(text)}) Tj`);
    commands.push("ET");
  }

  function addWrappedText(
    commands: string[],
    text: string,
    x: number,
    y: number,
    size: number,
    font: "F1" | "F2",
    color: [number, number, number],
    maxChars: number,
    lineHeight: number,
  ) {
    const lines = wrapPdfText(text, maxChars);
    lines.forEach((line, index) => {
      addTextLine(commands, line, x, y - index * lineHeight, size, font, color);
    });
    return y - Math.max(lines.length, 1) * lineHeight;
  }

  function addFilledRect(
    commands: string[],
    x: number,
    y: number,
    width: number,
    height: number,
    fill: [number, number, number],
    stroke: [number, number, number],
  ) {
    commands.push(`${fill[0]} ${fill[1]} ${fill[2]} rg`);
    commands.push(`${stroke[0]} ${stroke[1]} ${stroke[2]} RG`);
    commands.push(`${x} ${y} ${width} ${height} re B`);
  }

  const textCommands: string[] = [];
  let currentY = pageHeight - margin;
  const navy: [number, number, number] = [0.078, 0.239, 0.424];
  const dark: [number, number, number] = [0.07, 0.09, 0.16];
  const slate: [number, number, number] = [0.20, 0.25, 0.32];
  const light: [number, number, number] = [0.40, 0.46, 0.55];
  const cardFill: [number, number, number] = [0.95, 0.97, 0.99];
  const cardStroke: [number, number, number] = [0.82, 0.87, 0.93];
  const headerHeight = 114;
  const headerTop = currentY + 6;
  const headerBottom = headerTop - headerHeight;
  const logoWidth = 110;
  const logoHeight = 82;
  const logoX = pageWidth - margin - logoWidth - 10;
  const logoY = headerTop - logoHeight - 12;

  if (headerLogo) {
    textCommands.push("q");
    textCommands.push(`${logoWidth} 0 0 ${logoHeight} ${logoX} ${logoY} cm`);
    textCommands.push(`/HeaderLogo Do`);
    textCommands.push("Q");
  }

  currentY = addWrappedText(
    textCommands,
    "NOVATECH MACHINERY CORPORATION (OPC) PRIVATE LIMITED",
    margin,
    currentY - 8,
    18,
    "F2",
    dark,
    32,
    21,
  );
  currentY -= 2;
  currentY = addWrappedText(
    textCommands,
    `Registered Office: ${contactDetails.officeAddress}`,
    margin,
    currentY,
    10,
    "F1",
    slate,
    56,
    13,
  );
  currentY = addWrappedText(
    textCommands,
    `Email: ${contactDetails.emailAddress} | Ph: ${contactDetails.phonePrimary} ${contactDetails.phoneSecondary}`,
    margin,
    currentY - 2,
    10,
    "F1",
    slate,
    60,
    13,
  );
  textCommands.push(`${dark[0]} ${dark[1]} ${dark[2]} RG`);
  textCommands.push(`${margin} ${headerBottom - 8} m ${pageWidth - margin} ${headerBottom - 8} l S`);
  currentY = Math.min(currentY - 18, headerBottom - 12);
  currentY = headerBottom - 34;

  currentY = addWrappedText(textCommands, title, margin, currentY, 22, "F2", navy, 34, 26);
  currentY -= 12;

  const cardTop = currentY;
  const cardHeight = 52;
  const cardGap = 12;
  const cardWidth = (pageWidth - margin * 2 - cardGap * 2) / 3;
  const infoCards = [
    { label: "Availability", value: "Import on Order" },
    { label: "Brand", value: brand || "-" },
    { label: "Model", value: model || "-" },
    { label: "Category", value: category || "-" },
    { label: "Subcategory", value: subcategory || "-" },
    { label: "Machine Type", value: machineType || "-" },
  ];

  infoCards.forEach((card, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + column * (cardWidth + cardGap);
    const y = cardTop - row * (cardHeight + cardGap);

    addFilledRect(textCommands, x, y - cardHeight, cardWidth, cardHeight, cardFill, cardStroke);
    addTextLine(textCommands, `${card.label} :`, x + 10, y - 17, 9, "F2", light);
    addWrappedText(textCommands, card.value, x + 10, y - 33, 11, "F1", dark, 26, 13);
  });

  currentY = cardTop - (cardHeight * 2) - cardGap - 24;
  addTextLine(textCommands, "Description", margin, currentY, 14, "F2", dark);
  currentY -= 18;

  descriptionLines.flatMap((item) => wrapPdfText(item, 84)).forEach((line) => {
    addTextLine(textCommands, line, margin, currentY, 11, "F1", slate);
    currentY -= 15;
  });

  currentY -= 38;
  const machineImagesHeading = "Machine Images";
  const headingSize = 14;
  const headingWidthEstimate = machineImagesHeading.length * 7.4;
  const headingX = (pageWidth - headingWidthEstimate) / 2;
  addTextLine(textCommands, machineImagesHeading, headingX, currentY, headingSize, "F2", dark);
  currentY -= 18;
  addTextLine(textCommands, "|", pageWidth / 2 - 2, currentY, 16, "F2", dark);
  currentY -= 12;
  addTextLine(textCommands, "|", pageWidth / 2 - 2, currentY, 16, "F2", dark);
  currentY -= 16;
  addTextLine(textCommands, "v", pageWidth / 2 - 4, currentY, 18, "F2", dark);

  const textContentId = streamObject(textCommands.join("\n"));
  contentObjectIds.push(textContentId);

  const firstPageId = pushObject(
    `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >>${headerLogo ? ` /XObject << /HeaderLogo ${imageObjectIds[0]} 0 R >>` : ""} >> /Contents ${textContentId} 0 R >>`,
  );
  pageObjectIds.push(firstPageId);

  for (let index = 0; index < images.length; index += 2) {
    const commands: string[] = [];
    const pageImages = images.slice(index, index + 2);
    const imageResourceEntries: string[] = [];
    let y = pageHeight - margin - 18;

    pageImages.forEach((image, pageImageIndex) => {
      const resourceName = `Im${index + pageImageIndex + 1}`;
      const imageObjectOffset = (headerLogo ? 1 : 0) + index + pageImageIndex;
      imageResourceEntries.push(`/${resourceName} ${imageObjectIds[imageObjectOffset]} 0 R`);
      const boxWidth = pageWidth - margin * 2;
      const boxHeight = 300;
      const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const x = margin + (boxWidth - drawWidth) / 2;
      const imageY = y - drawHeight;

      commands.push("q");
      commands.push(`${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${imageY.toFixed(2)} cm`);
      commands.push(`/${resourceName} Do`);
      commands.push("Q");
      y = imageY - 22;
    });

    const contentId = streamObject(commands.join("\n"));
    contentObjectIds.push(contentId);
    const pageId = pushObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> /XObject << ${imageResourceEntries.join(" ")} >> >> /Contents ${contentId} 0 R >>`,
    );
    pageObjectIds.push(pageId);
  }

  const pagesObjectId = pushObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`,
  );

  objects[pageObjectIds[0] - 1] = new TextEncoder().encode(
    `${pageObjectIds[0]} 0 obj\n<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >>${headerLogo ? ` /XObject << /HeaderLogo ${imageObjectIds[0]} 0 R >>` : ""} >> /Contents ${contentObjectIds[0]} 0 R >>\nendobj\n`,
  );

  for (let pageIndex = 1; pageIndex < pageObjectIds.length; pageIndex += 1) {
    const imageStart = (pageIndex - 1) * 2;
    const imageOffset = headerLogo ? 1 : 0;
    const imageEntries = images
      .slice(imageStart, imageStart + 2)
      .map(
        (_, imageIndex) =>
          `/Im${imageStart + imageIndex + 1} ${imageObjectIds[imageOffset + imageStart + imageIndex]} 0 R`,
      )
      .join(" ");

    objects[pageObjectIds[pageIndex] - 1] = new TextEncoder().encode(
      `${pageObjectIds[pageIndex]} 0 obj\n<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> /XObject << ${imageEntries} >> >> /Contents ${contentObjectIds[pageIndex]} 0 R >>\nendobj\n`,
    );
  }

  const catalogObjectId = pushObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

  let totalLength = 0;
  const header = new TextEncoder().encode("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  totalLength += header.length;

  objects.forEach((objectBytes) => {
    offsets.push(totalLength);
    totalLength += objectBytes.length;
  });

  const xrefStart = totalLength;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  offsets.forEach((offset) => {
    xrefLines.push(`${offset.toString().padStart(10, "0")} 00000 n `);
  });
  const xref = new TextEncoder().encode(`${xrefLines.join("\n")}\n`);
  const trailer = new TextEncoder().encode(
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );
  totalLength += xref.length + trailer.length;

  const pdf = new Uint8Array(totalLength);
  let cursor = 0;
  pdf.set(header, cursor);
  cursor += header.length;
  objects.forEach((objectBytes) => {
    pdf.set(objectBytes, cursor);
    cursor += objectBytes.length;
  });
  pdf.set(xref, cursor);
  cursor += xref.length;
  pdf.set(trailer, cursor);

  return new File([pdf], fileName, { type: "application/pdf" });
}

export type MachineMode = "all" | "conventional" | "cnc";

type MetalWorkingCatalogueProps = {
  machineCategories: MachineCategory[];
  machineInventory: MachineItem[];
  initialCategory?: string | null;
  initialSubcategory?: string | null;
  initialMachineId?: string | null;
  initialMachineMode?: MachineMode | null;
  initialSearchQuery?: string | null;
  pageHeading?: string;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function sanitizeDownloadName(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "novatech-machine-image"
  );
}

function buildJpegDownloadHref(imageSrc: string, machineTitle: string, imageIndex: number) {
  const params = new URLSearchParams({
    src: imageSrc,
    name: `${sanitizeDownloadName(machineTitle)}-${imageIndex + 1}`,
  });

  return `/api/download-image?${params.toString()}`;
}

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 8) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage <= 4) {
    [2, 3, 4, 5, 6].forEach((page) => pages.add(page));
  } else if (currentPage >= totalPages - 3) {
    [totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) =>
      pages.add(page),
    );
  } else {
    [currentPage - 1, currentPage + 1].forEach((page) => pages.add(page));
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push(previousPage === 1 ? "ellipsis-left" : "ellipsis-right");
    }

    items.push(page);
  });

  return items;
}

export default function MetalWorkingCatalogue({
  machineCategories,
  machineInventory,
  initialCategory = null,
  initialSubcategory = null,
  initialMachineId = null,
  initialMachineMode = null,
  initialSearchQuery = null,
  pageHeading = "Metal Working Machinery",
}: MetalWorkingCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();

  function isSpecialDealsCategory(value: string | null) {
    const normalized = value?.trim().toLowerCase();
    return normalized === "special deals" || normalized === "special-deals";
  }

  function matchesCategoryValue(category: MachineCategory, value: string | null) {
    if (!value) {
      return false;
    }

    return category.name === value || category.slug === value;
  }

  const machineById = useMemo(
    () => new Map(machineInventory.map((machine) => [machine.id, machine] as const)),
    [machineInventory]
  );

  const subcategoryToCategory = useMemo(
    () => {
      const map = new Map<string, string>();

      for (const machine of machineInventory) {
        if (!machine.subcategory) {
          continue;
        }

        map.set(machine.subcategory, machine.category);

        if (machine.subcategorySlug) {
          map.set(machine.subcategorySlug, machine.category);
        }
      }

      for (const category of machineCategories) {
        for (const sub of category.sub ?? []) {
          map.set(sub, category.name);
        }
      }

      return map;
    },
    [machineCategories, machineInventory]
  );

  const subcategoryValueToName = useMemo(() => {
    const map = new Map<string, string>();

    for (const machine of machineInventory) {
      if (!machine.subcategory) {
        continue;
      }

      map.set(machine.subcategory, machine.subcategory);

      if (machine.subcategorySlug) {
        map.set(machine.subcategorySlug, machine.subcategory);
      }
    }

    return map;
  }, [machineInventory]);

  const initialSelectedMachine = initialMachineId ? machineById.get(initialMachineId) ?? null : null;
  const matchedInitialCategory =
    machineCategories.find((category) => matchesCategoryValue(category, initialCategory))?.name ?? null;
  const initialSelectedCategory =
    initialSelectedMachine?.category ??
    (initialSubcategory ? subcategoryToCategory.get(initialSubcategory) : null) ??
    matchedInitialCategory;
  const initialResolvedSubcategory =
    initialSelectedMachine?.subcategory ??
    (initialSubcategory ? subcategoryValueToName.get(initialSubcategory) ?? initialSubcategory : null);

  const [categorySearch, setCategorySearch] = useState("");
  const [machineSearch, setMachineSearch] = useState(initialSearchQuery ?? "");
  const [isMachineSearchOpen, setIsMachineSearchOpen] = useState(false);
  const [sortBy] = useState<"newest" | "a-z">("newest");
  const [machineMode, setMachineMode] = useState<MachineMode>(initialMachineMode ?? "all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
  const [canScrollThumbnailsLeft, setCanScrollThumbnailsLeft] = useState(false);
  const [canScrollThumbnailsRight, setCanScrollThumbnailsRight] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullImageHint, setShowFullImageHint] = useState(Boolean(initialMachineId));
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialSelectedCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialResolvedSubcategory);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(initialMachineId);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        machineCategories.map((c) => [c.name, c.name === initialSelectedCategory])
      )
  );

  const selectedMachine = selectedMachineId ? machineById.get(selectedMachineId) ?? null : null;
  const activeFilters = [selectedCategory, selectedSubcategory].filter(Boolean) as string[];

  const filteredSidebarCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();

    if (!q) {
      return machineCategories;
    }

    return machineCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.sub?.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categorySearch, machineCategories]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        machineCategories.map((category) => [
          category.name,
          isSpecialDealsCategory(category.name)
            ? machineInventory.filter((machine) => machine.isSpecialDeal).length
            : machineInventory.filter((machine) => machine.category === category.name).length,
        ])
      ),
    [machineCategories, machineInventory]
  );

  const filteredMachines = useMemo(() => {
    const q = machineSearch.toLowerCase();

    let result = machineInventory.filter((m) => {
      return (
        (machineMode === "all" || m.machineType === machineMode) &&
        (!selectedCategory ||
          (isSpecialDealsCategory(selectedCategory) ? m.isSpecialDeal : m.category === selectedCategory)) &&
        (!selectedSubcategory || m.subcategory === selectedSubcategory) &&
        (!q ||
          [m.title, m.description, m.category, m.subcategory]
            .filter(Boolean)
            .some((v) => v?.toLowerCase().includes(q)))
      );
    });

    if (sortBy === "a-z") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [machineInventory, machineMode, selectedCategory, selectedSubcategory, machineSearch, sortBy]);

  const machineSearchSuggestions = useMemo(() => {
    const q = machineSearch.trim().toLowerCase();

    if (!q) {
      return [];
    }

    return filteredMachines
      .slice()
      .sort((left, right) => {
        const leftStartsWith = left.title.toLowerCase().startsWith(q) ? 0 : 1;
        const rightStartsWith = right.title.toLowerCase().startsWith(q) ? 0 : 1;

        if (leftStartsWith !== rightStartsWith) {
          return leftStartsWith - rightStartsWith;
        }

        return left.title.localeCompare(right.title);
      })
      .filter((machine, index, machines) => {
        return machines.findIndex((item) => item.title === machine.title) === index;
      })
      .slice(0, 6);
  }, [filteredMachines, machineSearch]);

  const machinesPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / machinesPerPage));
  const paginatedMachines = useMemo(() => {
    const start = (currentPage - 1) * machinesPerPage;
    return filteredMachines.slice(start, start + machinesPerPage);
  }, [currentPage, filteredMachines]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 320);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!thumbnailStripRef.current || typeof window === "undefined") {
      return;
    }

    const strip = thumbnailStripRef.current;

    function updateThumbnailScrollState() {
      const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
      setCanScrollThumbnailsLeft(strip.scrollLeft > 8);
      setCanScrollThumbnailsRight(maxScrollLeft - strip.scrollLeft > 8);
    }

    updateThumbnailScrollState();
    strip.addEventListener("scroll", updateThumbnailScrollState, { passive: true });
    window.addEventListener("resize", updateThumbnailScrollState);

    return () => {
      strip.removeEventListener("scroll", updateThumbnailScrollState);
      window.removeEventListener("resize", updateThumbnailScrollState);
    };
  }, [selectedMachineId, selectedMachine?.images?.length]);

  useEffect(() => {
    if (!showFullImageHint) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowFullImageHint(false), 12200);

    return () => window.clearTimeout(timeoutId);
  }, [showFullImageHint]);

  function toggleCategory(name: string) {
    setOpenCategories((prev) =>
      Object.fromEntries(
        machineCategories.map((category) => [category.name, category.name === name ? !prev[name] : false])
      )
    );
  }

  function toggleSubcategory(sub: string) {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setSelectedSubcategory((cur) => (cur === sub ? null : sub));
    setSelectedCategory(subcategoryToCategory.get(sub) ?? null);
    setIsMobileSidebarOpen(false);
  }

  function handleCategoryClick(categoryName: string, hasChildren: boolean) {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);

    if (hasChildren) {
      toggleCategory(categoryName);
      return;
    }

    setOpenCategories(() =>
      Object.fromEntries(machineCategories.map((category) => [category.name, false]))
    );
    setIsMobileSidebarOpen(false);
  }

  function handleAllMachinesClick() {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setMachineMode("all");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setOpenCategories(() =>
      Object.fromEntries(machineCategories.map((category) => [category.name, false]))
    );
    setIsMobileSidebarOpen(false);
    router.push(pathname);
  }

  function clearCategoryFilter(filter: string) {
    setSelectedMachineId(null);
    setCurrentPage(1);

    if (selectedSubcategory === filter) {
      setSelectedSubcategory(null);
      return;
    }

    if (selectedCategory === filter) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setOpenCategories(() =>
        Object.fromEntries(machineCategories.map((category) => [category.name, false]))
      );
    }
  }

  const toolbarButtons = [
    { label: "All Machines", value: "all" },
    { label: "Conventional Machines", value: "conventional" },
    { label: "CNC Machines", value: "cnc" },
  ];

  function handleMachineModeChange(value: MachineMode) {
    setCurrentPage(1);
    setMachineMode(value);
    setSelectedMachineId(null);

    const params = new URLSearchParams();

    if (selectedCategory) {
      const resolvedCategory = machineCategories.find((item) => item.name === selectedCategory);
      params.set("category", resolvedCategory?.slug ?? selectedCategory);
    }

    if (selectedSubcategory) {
      params.set("subcategory", selectedSubcategory);
    }

    if (value !== "all") {
      params.set("mode", value);
    }

    if (machineSearch.trim()) {
      params.set("q", machineSearch.trim());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleMachineSearchChange(value: string) {
    setCurrentPage(1);
    setMachineSearch(value);
    setIsMachineSearchOpen(true);
  }

  function applyMachineSearchSuggestion(value: string) {
    setCurrentPage(1);
    setMachineSearch(value);
    setIsMachineSearchOpen(false);
  }

  function openMachine(machineId: string, category?: string, subcategory?: string) {
    setSelectedMachineId(machineId);
    setActiveImageIndex(0);
    setShowFullImageHint(true);

    if (category) {
      setSelectedCategory(category);
    }

    setSelectedSubcategory(subcategory ?? null);

    const params = new URLSearchParams();

    if (category) {
      const resolvedCategory = machineCategories.find((item) => item.name === category);
      params.set("category", resolvedCategory?.slug ?? category);
    }

    if (subcategory) {
      params.set("subcategory", subcategory);
    }

    if (machineMode !== "all") {
      params.set("mode", machineMode);
    }

    if (machineSearch.trim()) {
      params.set("q", machineSearch.trim());
    }

    params.set("machine", machineId);

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleBackToResults() {
    setSelectedMachineId(null);

    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (selectedSubcategory) {
      params.set("subcategory", selectedSubcategory);
    }

    if (machineMode !== "all") {
      params.set("mode", machineMode);
    }

    if (machineSearch.trim()) {
      params.set("q", machineSearch.trim());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToResultsTop() {
    if (!resultsTopRef.current) {
      return;
    }

    const top = resultsTopRef.current.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }

  const machineDetailGallery = selectedMachine
    ? (selectedMachine.images?.length ? selectedMachine.images : [selectedMachine.imageSrc]).map((src, index) => ({
        id: `${selectedMachine.id}-thumb-${index}`,
        src,
        alt: `${selectedMachine.title} view ${index + 1}`,
        position:
          selectedMachine.imagePositions?.[index] ??
          selectedMachine.imagePosition ??
          (index % 2 === 0 ? "center" : "55% center"),
      }))
    : [];

  const machineDetailDescription = selectedMachine
    ? (selectedMachine.description ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  const machineSpecifications = selectedMachine
    ? [
        { label: "Brand", value: selectedMachine.manufacturer || "-" },
        { label: "Model", value: selectedMachine.model || "-" },
        { label: "Machine Type", value: selectedMachine.machineType === "cnc" ? "CNC" : "Conventional" },
        { label: "Condition", value: selectedMachine.condition || "-" },
      ]
    : [];

  const similarMachines = selectedMachine
    ? machineInventory
        .filter((machine) => machine.id !== selectedMachine.id)
        .map((machine) => {
          let score = 0;

          if (machine.category === selectedMachine.category) {
            score += 3;
          }

          if (selectedMachine.subcategory && machine.subcategory === selectedMachine.subcategory) {
            score += 4;
          }

          if (machine.machineType === selectedMachine.machineType) {
            score += 2;
          }

          return { machine, score };
        })
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.machine.title.localeCompare(right.machine.title);
        })
        .slice(0, 4)
        .map((item) => item.machine)
    : [];

  const activeGalleryImage =
    machineDetailGallery[activeImageIndex] ?? machineDetailGallery[0] ?? null;
  const hasMultipleGalleryImages = machineDetailGallery.length > 1;
  const activeImageDownloadHref =
    selectedMachine && activeGalleryImage
      ? buildJpegDownloadHref(activeGalleryImage.src, selectedMachine.title, activeImageIndex)
      : "#";

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const galleryLength = machineDetailGallery.length;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft" && galleryLength > 1) {
        setActiveImageIndex((current) => (current === 0 ? galleryLength - 1 : current - 1));
      }

      if (event.key === "ArrowRight" && galleryLength > 1) {
        setActiveImageIndex((current) => (current === galleryLength - 1 ? 0 : current + 1));
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, machineDetailGallery.length]);

  function selectGalleryImage(index: number) {
    setActiveImageIndex(index);
  }

  function showPreviousGalleryImage() {
    if (machineDetailGallery.length <= 1) {
      return;
    }

    setActiveImageIndex((current) =>
      current === 0 ? machineDetailGallery.length - 1 : current - 1,
    );
  }

  function showNextGalleryImage() {
    if (machineDetailGallery.length <= 1) {
      return;
    }

    setActiveImageIndex((current) =>
      current === machineDetailGallery.length - 1 ? 0 : current + 1,
    );
  }

  function scrollThumbnailStrip(direction: "left" | "right") {
    if (!thumbnailStripRef.current) {
      return;
    }

    const scrollAmount = thumbnailStripRef.current.clientWidth * 0.7;
    thumbnailStripRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  async function handleDownloadMachinePdf() {
    if (!selectedMachine || typeof window === "undefined") {
      return;
    }

    const descriptionLines = (
      machineDetailDescription.length > 0
        ? machineDetailDescription
        : ["Please contact Novatech for complete machine details."]
    )
      .flatMap((line) =>
        line
          .split(/\n+/)
          .flatMap((part) => part.split(/(?<=\.)\s+/))
          .map((part) => part.trim())
          .filter(Boolean),
      );

    const preparedImages = (
      await Promise.all(
        machineDetailGallery.map((image, index) =>
          convertImageToJpegData(image.src, `Image ${index + 1} - ${selectedMachine.title}`),
        ),
      )
    ).filter((item): item is { bytes: Uint8Array; width: number; height: number; caption: string } => item !== null);

    const headerLogo = await convertImageToJpegData("/main-logo.png", "Novatech Logo");

    const fileName = formatMachinePdfFileName(selectedMachine);
    const file = buildMachinePdf({
      fileName,
      title: selectedMachine.title,
      machineType: selectedMachine.machineType.toUpperCase(),
      brand: selectedMachine.manufacturer ?? "",
      model: selectedMachine.model ?? "",
      category: selectedMachine.category ?? "",
      subcategory: selectedMachine.subcategory ?? "",
      descriptionLines,
      images: preparedImages,
      headerLogo,
    });

    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }

  return (
    <section className="w-full overflow-x-clip px-2.5 pb-8 pt-3 sm:px-4 sm:pb-10 sm:pt-4 lg:px-5 xl:px-8 2xl:px-10">
      {!selectedMachine ? (
      <div className="border-b border-slate-200 pb-2.5 sm:pb-3">
        <h1 className="mt-1 text-[1.55rem] font-black tracking-tight text-slate-950 sm:text-[2rem] lg:text-[2.65rem]">
          {pageHeading}
        </h1>

        <div className="hidden lg:block">
          <div className="min-w-0">
            {activeFilters.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => setIsMobileSidebarOpen((current) => !current)}
                    className="inline-flex min-h-10 w-[max(230px,19%)] shrink-0 items-center justify-center gap-2 border border-[#145b93] bg-white px-5 text-sm font-black uppercase tracking-[0.08em] text-[#145b93] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:bg-sky-50"
                    aria-expanded={isMobileSidebarOpen}
                    aria-label={isMobileSidebarOpen ? "Close filters" : "Open filters"}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#145b93] px-1.5 text-[0.68rem] leading-none text-white">
                      {activeFilters.length}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter) => (
                      <button suppressHydrationWarning
                        key={filter}
                        type="button"
                        onClick={() => clearCategoryFilter(filter)}
                        className="inline-flex min-h-10 items-center gap-2 border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-[#145b93] transition hover:border-[#145b93]"
                      >
                        <span>{filter}</span>
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ))}
                    <button suppressHydrationWarning
                      type="button"
                      onClick={handleAllMachinesClick}
                      className="inline-flex min-h-10 items-center border border-[#E32636] bg-[#E32636] px-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(227,38,54,0.18)] transition hover:border-[#C91F30] hover:bg-[#C91F30]"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
      ) : null}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Mobile half-screen drawer Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {!selectedMachine ? (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
              isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />
          {/* Half-screen drawer panel */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-[50vw] min-w-[260px] max-w-[340px] flex-col bg-white shadow-[4px_0_32px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out lg:hidden ${
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-label="Category sidebar"
          >
            <div className="flex items-center justify-between bg-[#E32636] px-4 py-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-white/80" />
                <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-white">Categories</span>
                {activeFilters.length > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-[0.65rem] leading-none text-white">
                    {activeFilters.length}
                  </span>
                ) : null}
              </div>
              <button suppressHydrationWarning type="button" onClick={() => setIsMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-90"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-slate-100 px-3 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input suppressHydrationWarning value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-full border border-[#E32636] bg-slate-50 py-2 pl-9 pr-3 text-[0.8rem] outline-none transition focus:border-[#E32636] focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
              {filteredSidebarCategories.map((cat) => {
                const isOpen = openCategories[cat.name];
                const hasChildren = !!cat.sub?.length;
                const CategoryIcon = sidebarCategoryIconMap[cat.name] ?? Factory;
                const categoryCount = categoryCounts[cat.name] ?? 0;
                return (
                  <div key={cat.name} className="overflow-hidden rounded-md border border-[#E32636] bg-white">
                    <button suppressHydrationWarning onClick={() => handleCategoryClick(cat.name, hasChildren)}
                      className="flex w-full items-center justify-between gap-2 bg-[#E32636] px-3 py-2.5 text-left text-white shadow-[0_8px_18px_rgba(227,38,54,0.18)] transition hover:bg-[#C91F30]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#E32636] shadow-[0_4px_10px_rgba(120,15,28,0.16)]">
                          <CategoryIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 text-[0.82rem] font-bold leading-5">{cat.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-white/15 px-1.5 py-1 text-[0.72rem] font-bold text-white">{categoryCount}</span>
                        {hasChildren && <ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-180" : ""} text-white`} />}
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-none border-t border-[#E32636] bg-white px-3 py-1.5" : "max-h-0"}`}>
                      <div className="space-y-0.5">
                        {cat.sub?.map((sub) => {
                          const isSubActive = selectedSubcategory === sub;
                          return (
                            <button suppressHydrationWarning key={sub}
                              onClick={() => { toggleSubcategory(sub); setIsMobileSidebarOpen(false); }}
                              className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[0.78rem] transition ${
                                isSubActive ? "bg-rose-50 font-semibold text-[#E32636]" : "bg-white text-slate-700 hover:bg-rose-50 hover:text-[#E32636]"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 shrink-0 rounded-full bg-[#E32636]`} />
                                <span>{sub}</span>
                              </span>
                              <span className={`text-[0.7rem] ${isSubActive ? "text-[#E32636]" : "text-[#E32636]/80"}`}>
                                {machineInventory.filter((machine) => machine.category === cat.name && machine.subcategory === sub).length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeFilters.length > 0 ? (
              <div className="border-t border-slate-200 p-3">
                <button suppressHydrationWarning type="button"
                  onClick={() => { handleAllMachinesClick(); setIsMobileSidebarOpen(false); }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E32636] py-2.5 text-[0.78rem] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#C91F30] active:scale-[0.98]"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}

      <div className={selectedMachine ? "mt-1 min-w-0" : "mt-3 grid min-w-0 gap-3 lg:grid-cols-[minmax(230px,19%)_minmax(0,1fr)] lg:gap-4"}>
        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Desktop sticky sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {!selectedMachine ? (
        <aside
          className="hidden lg:sticky lg:top-2 lg:flex lg:h-[calc(100vh-1rem)] lg:max-h-[calc(100vh-1rem)] lg:flex-col lg:self-start lg:overflow-hidden lg:border lg:border-slate-200 lg:bg-white lg:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
        >
          <div className="flex items-center gap-2 bg-[#E32636] px-4 py-3 text-white">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-[0.76rem] font-black uppercase tracking-[0.14em]">Categories</span>
            {activeFilters.length > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[0.66rem] font-bold">
                {activeFilters.length}
              </span>
            ) : null}
          </div>
          <div className="border-b border-slate-100 px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input suppressHydrationWarning
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 lg:max-h-none">
            {filteredSidebarCategories.map((cat) => {
              const isOpen = openCategories[cat.name];
              const hasChildren = !!cat.sub?.length;
              const isCategoryActive = selectedCategory === cat.name && !selectedSubcategory;
              const CategoryIcon = sidebarCategoryIconMap[cat.name] ?? CircleHelp;
              const categoryCount = categoryCounts[cat.name] ?? 0;
              return (
                <div key={cat.name} className={`overflow-hidden rounded-md border bg-white shadow-[0_5px_14px_rgba(15,23,42,0.05)] transition ${isCategoryActive || isOpen ? "border-sky-200" : "border-slate-200"}`}>
                  <button suppressHydrationWarning onClick={() => handleCategoryClick(cat.name, hasChildren)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition ${
                      isCategoryActive || isOpen
                        ? "border-l-4 border-[#145b93] bg-sky-50 text-[#145b93]"
                        : "border-l-4 border-transparent bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <CategoryIcon className={`h-5 w-5 shrink-0 ${isCategoryActive || isOpen ? "text-[#145b93]" : "text-slate-600"}`} />
                      <span className="text-[0.9rem] font-semibold leading-5">{cat.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`inline-flex min-w-7 items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${isCategoryActive || isOpen ? "bg-sky-100 text-[#145b93]" : "bg-slate-100 text-slate-500"}`}>{categoryCount}</span>
                      {hasChildren && <ChevronDown className={`h-4.5 w-4.5 shrink-0 transition ${isOpen ? "rotate-180 text-[#145b93]" : "text-slate-500"}`} />}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-none border-l-4 border-t border-[#145b93] border-t-sky-100 bg-sky-50/60 px-4 py-2" : "max-h-0"}`}>
                    <div className="space-y-1 bg-transparent">
                      {cat.sub?.map((sub) => {
                        const isSubActive = selectedSubcategory === sub;
                        return (
                          <button suppressHydrationWarning key={sub} onClick={() => toggleSubcategory(sub)}
                            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                              isSubActive ? "bg-white font-semibold text-[#145b93]" : "bg-transparent text-slate-700 hover:bg-white hover:text-[#145b93]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[#145b93]" />
                              <span>{sub}</span>
                            </span>
                            <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-sky-100 px-1.5 py-1 text-xs font-semibold text-slate-600">
                              {machineInventory.filter((machine) => machine.category === cat.name && machine.subcategory === sub).length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        ) : null}

        {/* PRODUCTS */}
        {selectedMachine ? (
          <div className="min-w-0 overflow-hidden border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-4 lg:p-5">
            <button suppressHydrationWarning
              type="button"
              onClick={handleBackToResults}
              className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Machines
            </button>

            <div className="mt-3 min-w-0">
              <div className="mb-3 min-w-0">
                <h1 className="break-words text-[1.35rem] font-semibold uppercase leading-tight text-slate-950 sm:text-[1.75rem] lg:text-[2rem]">
                  {selectedMachine.title}
                </h1>

                <div className="mt-2 grid min-w-0 grid-cols-1 gap-1.5 min-[520px]:grid-cols-3 sm:gap-2 lg:gap-3">
                  <a
                    href={REQUEST_PRICE_WHATSAPP_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[38px] min-w-0 items-center justify-center gap-1 border border-[#145b93] bg-[#145b93] px-2 py-1.5 text-center text-[0.72rem] font-semibold leading-tight text-white transition hover:bg-[#0f4c7c] sm:min-h-[42px] sm:gap-2 sm:px-3 sm:text-sm"
                  >
                    <CircleDollarSign className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="min-w-0">Request Price</span>
                  </a>
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[38px] min-w-0 items-center justify-center gap-1 border border-slate-300 bg-white px-2 py-1.5 text-center text-[0.72rem] font-semibold leading-tight text-slate-800 transition hover:border-[#145b93] hover:text-[#145b93] sm:min-h-[42px] sm:gap-2 sm:px-3 sm:text-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="min-w-0">WhatsApp</span>
                  </a>
                  <a
                    href="tel:+919646255855"
                    className="inline-flex min-h-[38px] min-w-0 items-center justify-center gap-1 border border-slate-300 bg-white px-2 py-1.5 text-center text-[0.72rem] font-semibold leading-tight text-slate-800 transition hover:border-[#145b93] hover:text-[#145b93] sm:min-h-[42px] sm:gap-2 sm:px-3 sm:text-sm"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="min-w-0">Call Now</span>
                  </a>
                </div>
              </div>

              <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
                <div className="min-w-0">
                  <div className="min-w-0">
                    <div className="overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="group relative flex h-[210px] w-full items-center justify-center overflow-hidden bg-white sm:h-[320px] md:h-[360px] lg:h-[420px]">
                        <button suppressHydrationWarning
                          type="button"
                          onClick={() => {
                            setShowFullImageHint(false);
                            setIsLightboxOpen(true);
                          }}
                          className="block h-full w-full cursor-zoom-in"
                          aria-label="Enlarge selected machine image"
                        >
                          <Image
                            src={activeGalleryImage?.src ?? selectedMachine.imageSrc}
                            alt={activeGalleryImage?.alt ?? selectedMachine.imageAlt}
                            width={1400}
                            height={920}
                            priority
                            unoptimized
                            quality={100}
                            sizes="(min-width: 1280px) 55vw, 100vw"
                            className="h-full w-full object-contain object-center"
                          />
                        </button>

                        {showFullImageHint ? (
                          <div className="pointer-events-none absolute inset-x-0 top-16 z-30 overflow-hidden px-3">
                            <div
                              role="status"
                              className="machine-image-click-hint flex w-max items-center gap-2 rounded-full border border-white/45 bg-[linear-gradient(90deg,rgba(20,91,147,0.96),rgba(14,116,144,0.96))] px-4 py-2 text-white shadow-[0_10px_28px_rgba(15,23,42,0.38)] backdrop-blur-md"
                            >
                              <Maximize2 className="h-4 w-4 shrink-0" />
                              <span className="text-xs font-black uppercase tracking-[0.08em] sm:text-sm">
                                Click to view full image
                              </span>
                            </div>
                          </div>
                        ) : null}

                        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-[linear-gradient(180deg,rgba(15,23,42,0.32),transparent)] px-3 py-3 text-white">
                          <span className="rounded-full bg-slate-950/55 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur">
                            {activeImageIndex + 1} / {machineDetailGallery.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={activeImageDownloadHref}
                              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] backdrop-blur transition hover:bg-[#145b93]"
                              aria-label="Download selected image as JPEG"
                              title="Download JPEG"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setShowFullImageHint(false);
                                setIsLightboxOpen(true);
                              }}
                              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] backdrop-blur transition hover:bg-[#145b93]"
                              aria-label="Open enlarged image"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {hasMultipleGalleryImages ? (
                          <>
                            <button suppressHydrationWarning
                              type="button"
                              onClick={showPreviousGalleryImage}
                              className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-slate-950/55 text-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] backdrop-blur transition hover:bg-[#145b93] sm:left-4 sm:h-11 sm:w-11"
                              aria-label="Show previous machine image"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button suppressHydrationWarning
                              type="button"
                              onClick={showNextGalleryImage}
                              className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-slate-950/55 text-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] backdrop-blur transition hover:bg-[#145b93] sm:right-4 sm:h-11 sm:w-11"
                              aria-label="Show next machine image"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-[2px] border border-slate-200 bg-white p-2">
                      <div className="relative">
                        {machineDetailGallery.length > 5 && canScrollThumbnailsLeft ? (
                          <button suppressHydrationWarning
                            type="button"
                            onClick={() => scrollThumbnailStrip("left")}
                            className="absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50/95 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition hover:border-[#145b93] hover:text-[#145b93]"
                            aria-label="Scroll thumbnails left"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        ) : null}

                        <div
                          ref={thumbnailStripRef}
                          className="grid grid-flow-col auto-cols-[72px] gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] sm:auto-cols-[96px] [&::-webkit-scrollbar]:hidden"
                        >
                          {machineDetailGallery.map((image, index) => (
                            <button suppressHydrationWarning
                              key={image.id}
                              type="button"
                              onClick={() => selectGalleryImage(index)}
                              className={`overflow-hidden border bg-white transition hover:border-[#145b93] ${
                                index === activeImageIndex ? "border-[#145b93]" : "border-slate-200"
                              }`}
                            >
                              <Image
                                src={image.src}
                                alt={image.alt}
                                width={150}
                                height={110}
                                loading="eager"
                                className="h-[72px] w-[72px] object-cover sm:h-20 sm:w-24"
                                style={{ objectPosition: image.position }}
                              />
                            </button>
                          ))}
                        </div>

                        {machineDetailGallery.length > 5 && canScrollThumbnailsRight ? (
                          <button suppressHydrationWarning
                            type="button"
                            onClick={() => scrollThumbnailStrip("right")}
                            className="absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50/95 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition hover:border-[#145b93] hover:text-[#145b93]"
                            aria-label="Scroll thumbnails right"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex flex-col gap-2">
                  <div className="min-w-0 border border-slate-200 bg-white p-2.5 sm:p-3">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-[0.84rem] font-semibold uppercase tracking-[0.08em] text-slate-950 sm:text-[0.95rem]">
                        Specifications
                      </span>
                      <span className="h-[2px] flex-1 bg-[#145b93]" />
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-1.5 min-[420px]:grid-cols-2 min-[720px]:grid-cols-4 sm:gap-2">
                      {machineSpecifications.length > 0 ? machineSpecifications.map((spec, index) => (
                        <div
                          key={`${spec.label}-${index}`}
                          className="min-w-0 border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-2.5 sm:py-2"
                        >
                          <span className="block min-w-0 break-words text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.06em] text-slate-500 sm:text-[0.72rem] sm:leading-5 lg:text-[0.78rem]">{spec.label}</span>
                          <span className="mt-0.5 block min-w-0 break-words text-[0.78rem] font-semibold leading-4 text-slate-950 sm:text-[0.86rem] sm:leading-5 lg:text-[0.95rem]">{spec.value}</span>
                        </div>
                      )) : (
                        <p className="px-2 py-2 text-sm text-slate-500">Please contact Novatech for machine details.</p>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 border border-slate-200 bg-white p-3 sm:p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-slate-950 sm:text-[0.98rem]">
                        Description
                      </span>
                      <span className="h-[2px] flex-1 bg-[#145b93]" />
                    </div>

                    <div className="min-w-0 space-y-2 break-words text-[0.94rem] leading-6 text-slate-600 sm:text-[0.98rem]">
                      {machineDetailDescription.length > 0 ? (
                        machineDetailDescription.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))
                      ) : (
                        <p>Please contact Novatech for complete machine details.</p>
                      )}
                    </div>

                    <div className="mt-5 flex justify-center border-t border-slate-200 pt-4">
                      <button suppressHydrationWarning
                        type="button"
                        onClick={handleDownloadMachinePdf}
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#145b93] bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_55%,#0f4c7c_100%)] px-4 py-2 text-center text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_24px_rgba(20,91,147,0.2)] transition hover:brightness-95 sm:w-auto sm:min-w-[320px]"
                      >
                        <Download className="h-4 w-4 shrink-0" />
                        <span>Download Machine Data & Images</span>
                      </button>

                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-slate-950 sm:text-[1.3rem]">
                      Similar Machines
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Related machines from the same category for quick comparison.
                    </p>
                  </div>
                  <button suppressHydrationWarning
                    type="button"
                    onClick={handleBackToResults}
                    className="inline-flex items-center justify-center text-lg font-black text-[#145b93] transition hover:text-[#0f4c7c] sm:text-xl"
                  >
                    &larr; More options
                  </button>
                </div>

                <div className="mt-4 grid gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
                  {similarMachines.length > 0 ? (
                    similarMachines.map((machine) => (
                      <GridMachineCard
                        key={machine.id}
                        m={machine}
                        onClick={() => openMachine(machine.id, machine.category, machine.subcategory)}
                      />
                    ))
                  ) : (
                    <div className="min-[520px]:col-span-2 xl:col-span-4">
                      <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-slate-600">
                        Similar machines will appear here as more inventory is added.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div ref={resultsTopRef} />
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid w-full min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
              {toolbarButtons.map((btn) => (
                <button suppressHydrationWarning
                  key={btn.value}
                  type="button"
                  onClick={() => handleMachineModeChange(btn.value as MachineMode)}
                  className={`flex min-h-12 min-w-0 items-center justify-center rounded-[2px] border px-1.5 py-1.5 text-center text-[0.72rem] font-black leading-tight transition min-[390px]:text-[0.78rem] sm:px-4 sm:text-[1rem] ${
                    machineMode === btn.value
                      ? "border-[#145b93] bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white"
                        : "border-slate-300 bg-white text-slate-950 hover:border-sky-300 hover:text-slate-950"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:justify-end">
                {/* Results count + mobile category icon */}
                <div className="flex items-center gap-2 sm:order-1">
                  {/* Mobile-only category sidebar icon */}
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => setIsMobileSidebarOpen((current) => !current)}
                    aria-expanded={isMobileSidebarOpen}
                    aria-label="Open category sidebar"
                    className="group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#145b93]/20 bg-white shadow-[0_2px_10px_rgba(20,91,147,0.10)] transition-all duration-200 hover:border-[#145b93] hover:bg-[#145b93] hover:shadow-[0_4px_16px_rgba(20,91,147,0.28)] active:scale-90 lg:hidden"
                  >
                    <PanelLeftOpen className="h-6 w-6 text-[#145b93] transition-colors duration-200 group-hover:text-white" />
                  </button>
                  <p className="text-sm font-medium text-slate-600 lg:text-right">
                    <span className="font-semibold text-slate-900">{filteredMachines.length}</span> results
                  </p>
                  {activeFilters.length > 0 ? (
                    <button suppressHydrationWarning
                      type="button"
                      onClick={handleAllMachinesClick}
                      className="inline-flex h-6 items-center gap-1 rounded-full bg-[#E32636] px-2 text-[0.65rem] font-black uppercase tracking-[0.06em] text-white transition hover:bg-[#C91F30] active:scale-95 lg:hidden"
                    >
                      <X className="h-2.5 w-2.5" />
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="relative w-full sm:order-2 sm:w-[290px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input suppressHydrationWarning
                    value={machineSearch}
                    onChange={(e) => handleMachineSearchChange(e.target.value)}
                    onFocus={() => {
                      if (machineSearch.trim()) {
                        setIsMachineSearchOpen(true);
                      }
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setIsMachineSearchOpen(false), 120);
                    }}
                    placeholder="Search machines..."
                    className="w-full rounded-[2px] border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-sky-100"
                  />
                  {isMachineSearchOpen && machineSearch.trim() && machineSearchSuggestions.length > 0 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
                      {machineSearchSuggestions.map((machine) => (
                        <button suppressHydrationWarning
                          key={machine.id}
                          type="button"
                          onClick={() => applyMachineSearchSuggestion(machine.title)}
                          className="flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
                        >
                          <span className="text-[0.86rem] font-black uppercase leading-tight text-slate-950">
                            {machine.title}
                          </span>
                          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            {[machine.machineType, machine.subcategory || machine.category].filter(Boolean).join(" | ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:gap-4">
              {paginatedMachines.length > 0 ? (
                paginatedMachines.map((m) => (
                  <GridMachineCard
                    key={m.id}
                    m={m}
                    onClick={() => openMachine(m.id, m.category, m.subcategory)}
                  />
                ))
              ) : (
                <div className="sm:col-span-2 xl:col-span-3">
                  <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
                    No machines found in the database for the current filters.
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex justify-center px-0 sm:px-2">
                <div className="flex max-w-full flex-wrap items-center justify-center gap-1 overflow-visible rounded-[1rem] border border-slate-200 bg-white/90 p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:rounded-full sm:p-2 sm:[scrollbar-width:none] md:justify-center sm:[&::-webkit-scrollbar]:hidden">
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setCurrentPage((page) => Math.max(1, page - 1));
                      scrollToResultsTop();
                    }}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-slate-700 transition hover:border-[#145b93] hover:bg-sky-50 hover:text-[#145b93] disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:min-w-9 sm:px-3 sm:text-xs sm:tracking-[0.08em]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {getPaginationItems(currentPage, totalPages).map((item) =>
                    typeof item === "number" ? (
                      <button suppressHydrationWarning
                        key={item}
                        type="button"
                        onClick={() => {
                          setCurrentPage(item);
                          scrollToResultsTop();
                        }}
                        aria-current={currentPage === item ? "page" : undefined}
                        className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border px-1.5 text-sm font-black transition sm:h-10 sm:min-w-10 sm:px-3 ${
                          item !== 1 && item !== totalPages && Math.abs(item - currentPage) > 1
                            ? "max-[389px]:hidden"
                            : ""
                        } ${
                          currentPage === item
                            ? "border-[#145b93] bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_52%,#0d4b80_100%)] text-white shadow-[0_10px_24px_rgba(20,91,147,0.26)]"
                            : "border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.04)] hover:border-[#145b93] hover:bg-sky-50 hover:text-[#145b93]"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="inline-flex h-8 min-w-5 shrink-0 items-center justify-center rounded-full text-sm font-black tracking-[0.1em] text-slate-400 sm:h-10 sm:min-w-7"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    ),
                  )}

                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                      scrollToResultsTop();
                    }}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-slate-700 transition hover:border-[#145b93] hover:bg-sky-50 hover:text-[#145b93] disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:min-w-9 sm:px-3 sm:text-xs sm:tracking-[0.08em]"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>

      {isLightboxOpen && activeGalleryImage ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/92 px-3 py-4 backdrop-blur-sm sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Machine image viewer"
          onMouseDown={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative flex h-full w-full max-w-7xl flex-col"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/80">
                  {selectedMachine?.title}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                  {activeImageIndex + 1} / {machineDetailGallery.length}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={activeImageDownloadHref}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white/20"
                  aria-label="Download enlarged image as JPEG"
                  title="Download JPEG"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-white/20"
                  aria-label="Close enlarged image"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2px] bg-black">
              <Image
                src={activeGalleryImage.src}
                alt={activeGalleryImage.alt}
                fill
                unoptimized
                quality={100}
                sizes="100vw"
                className="object-contain"
              />

              {hasMultipleGalleryImages ? (
                <>
                  <button suppressHydrationWarning
                    type="button"
                    onClick={showPreviousGalleryImage}
                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/60 text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#145b93] sm:left-5 sm:h-12 sm:w-12"
                    aria-label="Show previous enlarged image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button suppressHydrationWarning
                    type="button"
                    onClick={showNextGalleryImage}
                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/60 text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#145b93] sm:right-5 sm:h-12 sm:w-12"
                    aria-label="Show next enlarged image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>

            {machineDetailGallery.length > 1 ? (
              <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {machineDetailGallery.map((image, index) => (
                  <button suppressHydrationWarning
                    key={`${image.id}-lightbox`}
                    type="button"
                    onClick={() => selectGalleryImage(index)}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[2px] border bg-black transition sm:h-20 sm:w-28 ${
                      index === activeImageIndex ? "border-white" : "border-white/20 hover:border-white/70"
                    }`}
                    aria-label={`Show enlarged image ${index + 1}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      unoptimized
                      sizes="112px"
                      className="object-cover"
                      style={{ objectPosition: image.position }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showScrollTop ? (
        <button suppressHydrationWarning
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#145b93] text-white shadow-[0_14px_30px_rgba(20,91,147,0.28)] transition hover:bg-[#0f4c7c] lg:hidden"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      ) : null}
    </section>
  );
}

