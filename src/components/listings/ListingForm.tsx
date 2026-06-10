"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/listings/MediaUploader";
import {
  createListingAction,
  updateListingAction,
  type ListingFormData,
  type MediaItem,
} from "@/app/actions/listings";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/listings-helpers";
import type { ListingCategory, ListingCondition, PriceType } from "@/types/database";

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CONDITIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PRICE_TYPES = [
  { value: "fixed", label: "Precio fijo" },
  { value: "negotiable", label: "Precio conversable" },
];

interface ListingFormProps {
  listingId?: string; // si viene, es edición
  defaultValues?: Partial<ListingFormData>;
}

const EMPTY: ListingFormData = {
  title: "",
  category: "" as ListingCategory,
  description: "",
  price: 0,
  price_type: "fixed",
  condition: "" as ListingCondition,
  location: "",
  brand: "",
  size: "",
  seasons_used: undefined,
  media: [],
};

export function ListingForm({ listingId, defaultValues }: ListingFormProps) {
  const [form, setForm] = useState<ListingFormData>({ ...EMPTY, ...defaultValues });
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData | "_general", string>>>({});
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = listingId
        ? await updateListingAction(listingId, form)
        : await createListingAction(form);

      if (result?.error) {
        const err = result.error;
        if (err.field) setErrors({ [err.field]: err.message });
        else setErrors({ _general: err.message });
      }
    });
  }

  const isEditing = !!listingId;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Título */}
      <Input
        label="Título de la publicación *"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        error={errors.title}
        placeholder="Ej: Esquís Rossignol 170cm + fijaciones"
        required
      />

      {/* Categoría */}
      <Select
        label="Categoría *"
        value={form.category}
        onChange={(e) => set("category", e.target.value as ListingCategory)}
        error={errors.category}
        options={CATEGORIES}
        placeholder="Seleccioná una categoría"
        required
      />

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Descripción *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => { set("description", e.target.value); }}
          rows={4}
          placeholder="Describí el estado, características, motivo de venta..."
          className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-colors resize-none placeholder:text-[var(--dim)]"
          style={{
            backgroundColor: "var(--bg2)",
            color: "var(--text)",
            borderColor: errors.description ? "rgb(239 68 68)" : "var(--border)",
          }}
          required
        />
        <div className="flex items-center justify-between">
          {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          <p className="text-xs ml-auto" style={{ color: "var(--dim)" }}>
            {form.description.length} caracteres
          </p>
        </div>
      </div>

      {/* Precio + Modalidad */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio (ARS) *"
          type="number"
          min={0}
          value={form.price || ""}
          onChange={(e) => set("price", Number(e.target.value))}
          error={errors.price}
          placeholder="0"
          required
        />
        <Select
          label="Modalidad *"
          value={form.price_type}
          onChange={(e) => set("price_type", e.target.value as PriceType)}
          error={errors.price_type}
          options={PRICE_TYPES}
          required
        />
      </div>

      {/* Estado del equipo */}
      <Select
        label="Estado del equipo *"
        value={form.condition}
        onChange={(e) => set("condition", e.target.value as ListingCondition)}
        error={errors.condition}
        options={CONDITIONS}
        placeholder="Seleccioná el estado"
        required
      />

      {/* Ubicación */}
      <Input
        label="Ubicación *"
        value={form.location}
        onChange={(e) => set("location", e.target.value)}
        error={errors.location}
        placeholder="Ej: Buenos Aires, Las Leñas"
        required
      />

      {/* Campos opcionales */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg2)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dim)" }}>
          Información adicional (opcional)
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marca"
            value={form.brand ?? ""}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Ej: Rossignol"
          />
          <Input
            label="Talle / Medida"
            value={form.size ?? ""}
            onChange={(e) => set("size", e.target.value)}
            placeholder="Ej: 170cm, 42"
          />
        </div>
        <Input
          label="Temporadas de uso"
          type="number"
          min={0}
          max={20}
          value={form.seasons_used ?? ""}
          onChange={(e) =>
            set("seasons_used", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="0 = sin usar"
          hint="¿Cuántas temporadas tiene el equipo?"
        />
      </div>

      {/* Media */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Fotos y video *
        </label>
        <MediaUploader
          value={form.media}
          onChange={(items: MediaItem[]) => set("media", items)}
          error={errors.media}
        />
      </div>

      {/* Error general */}
      {errors._general && (
        <p className="text-sm text-red-400 text-center">{errors._general}</p>
      )}

      <Button type="submit" loading={isPending} fullWidth size="lg">
        {isEditing ? "Guardar cambios" : "Publicar equipo"}
      </Button>
    </form>
  );
}
