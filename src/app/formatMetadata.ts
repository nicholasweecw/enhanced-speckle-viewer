import { z } from "zod";

export type MetadataSection = {
  title: string;
  entries: { label: string; value: string }[];
};

// Zod schema to validate and type Speckle model metadata
export const MetadataSchema = z.object({
  name: z.string().optional(),
  speckle_type: z.string().optional(),
  units: z.string().optional(),
  id: z.string(),
  applicationId: z.string().optional(),
  displayStyle: z
    .object({
      color: z.union([z.number(), z.string()]),
      linetype: z.string(),
      lineweight: z.number(),
      lineSource: z.string(),
    })
    .optional(),
  renderMaterial: z
    .object({
      name: z.string(),
      diffuse: z.union([z.string(), z.number()]),
      opacity: z.number(),
      metalness: z.number(),
      roughness: z.number(),
    })
    .optional(),
  transform: z
    .object({
      matrix: z.array(z.number()).min(16),
    })
    .optional(),
  definition: z
    .object({
      name: z.string(),
      geometry: z.array(z.any()).optional(),
      basePoint: z
        .object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        })
        .optional(),
    })
    .optional(),
  userStrings: z.record(z.any()).optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;

// Formats raw component metadata into structured sections for display
export function formatMetadata(rawData: Metadata): MetadataSection[] {
  const parsed = MetadataSchema.safeParse(rawData);
  if (!parsed.success) return [];

  const data = parsed.data;
  const sections: MetadataSection[] = [];

  // 1. Basic Info — Always shown for every component
  sections.push({
    title: "Basic Info",
    entries: [
      { label: "Name", value: data.name || "–" },
      { label: "Type", value: data.speckle_type || "–" },
      { label: "Units", value: data.units || "–" },
      { label: "ID", value: data.id || "–" },
      { label: "App ID", value: data.applicationId || "–" },
    ],
  });

  // 2. Display Style — Styling attributes if available
  if (data.displayStyle) {
    const style = data.displayStyle;
    sections.push({
      title: "Display Style",
      entries: [
        { label: "Color", value: String(style.color) },
        { label: "Linetype", value: style.linetype },
        { label: "Lineweight", value: String(style.lineweight) },
        { label: "Line Source", value: style.lineSource },
      ],
    });
  }

  // 3. Material — Visual material properties if defined
  if (data.renderMaterial) {
    const mat = data.renderMaterial;
    sections.push({
      title: "Material",
      entries: [
        { label: "Name", value: mat.name },
        { label: "Diffuse", value: String(mat.diffuse) },
        { label: "Opacity", value: String(mat.opacity) },
        { label: "Metalness", value: String(mat.metalness) },
        { label: "Roughness", value: String(mat.roughness) },
      ],
    });
  }

  // 4. Transform — Transformation matrix (4x4) flattened
  if (data.transform?.matrix) {
    const matrix = data.transform.matrix;
    sections.push({
      title: "Transform",
      entries: [{ label: "Matrix", value: matrix.slice(0, 16).join(", ") }],
    });
  }

  // 5. Definition — Geometry info and base position
  if (data.definition) {
    const def = data.definition;
    sections.push({
      title: "Definition",
      entries: [
        { label: "Name", value: def.name },
        { label: "Geometry Count", value: String(def.geometry?.length || 0) },
        {
          label: "Base Point",
          value: `x: ${def.basePoint?.x}, y: ${def.basePoint?.y}, z: ${def.basePoint?.z}`,
        },
      ],
    });
  }

  // 6. User Data — Filtered user strings (excluding internal IDs)
  if (data.userStrings) {
    const strings = Object.entries(data.userStrings).filter(
      ([k]) =>
        !["id", "speckle_type", "applicationId", "totalChildrenCount"].includes(
          k
        )
    );

    if (strings.length > 0) {
      sections.push({
        title: "User Data",
        entries: strings.map(([key, val]) => ({
          label: key,
          value: String(val),
        })),
      });
    }
  }

  return sections;
}
