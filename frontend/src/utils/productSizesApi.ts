import apiFetch from "./api";
import { SizeInput } from "@/components/admin/SizeEditor";

type UploadFn = (file: File, filename: string) => Promise<string>;

const buildSizeImageName = (productId: number, size: SizeInput): string => {
  const ext = size.imageFile!.name.split(".").pop() || "jpg";
  const sanitized = size.size.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
  return `${productId}-size-${sanitized}.${ext}`;
};

/**
 * Sincroniza el listado de tallas del producto: elimina las quitadas,
 * sube imágenes nuevas y crea/actualiza el resto.
 */
export async function syncProductSizes(opts: {
  productId: number;
  current: SizeInput[];
  original?: SizeInput[];
  upload: UploadFn;
}): Promise<void> {
  const { productId, current, original = [], upload } = opts;
  const currentIds = new Set(current.flatMap((s) => s.id ? [s.id] : []));

  // Borrar las que ya no están — en paralelo
  await Promise.all(
    original
      .filter((s) => s.id && !currentIds.has(s.id))
      .map((s) => apiFetch(`/api/product-sizes/${s.id}`, { method: "DELETE" }))
  );

  // Crear o actualizar el resto
  for (let i = 0; i < current.length; i++) {
    const size = current[i];
    if (!size.size || size.price === "") {
      throw new Error(`Tamaño ${i + 1}: Completa el nombre y precio`);
    }

    let imageFilename: string | null = size.image || null;
    if (size.imageFile) {
      imageFilename = await upload(size.imageFile, buildSizeImageName(productId, size));
    } else if (size.imagePreview === null && size.image) {
      imageFilename = null;
    }

    const body = JSON.stringify({
      ...(size.id ? {} : { productId }),
      size: size.size.trim(),
      price: Number(size.price),
      image: imageFilename,
    });

    const res = await apiFetch(
      size.id ? `/api/product-sizes/${size.id}` : `/api/product-sizes`,
      { method: size.id ? "PUT" : "POST", body },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error guardando tamaño ${i + 1}`);
    }
  }
}

/** Crea las tallas para un producto nuevo (sin existentes). */
const createProductSizes = (
  productId: number,
  sizes: SizeInput[],
  upload: UploadFn,
) => syncProductSizes({ productId, current: sizes, upload });
