import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import {
  deleteCategory,
  fetchCategories,
  upsertCategory,
} from '@/lib/data/categories';
import type { Category } from '@/types/database';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** Manage topic categories. */
export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = React.useState(0);
  const state = useAsync(() => fetchCategories(), [reloadKey]);
  const categories = state.data ?? [];

  function reload() {
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="container max-w-3xl py-10 animate-fade-in">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.backToOverview')}
      </Link>

      <h1 className="mt-6 font-serif text-h1">{t('admin.categoriesTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('admin.categoriesDescription')}
      </p>

      <CategoryForm onSaved={reload} />

      <section className="mt-10">
        <h2 className="text-h3 font-serif">{t('admin.existingCategories')}</h2>

        {state.status === 'loading' && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {state.status === 'success' && categories.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} onDeleted={reload} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CategoryForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation();
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [nameEn, setNameEn] = React.useState('');
  const [nameFr, setNameFr] = React.useState('');
  const [nameRw, setNameRw] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(nameEn));
  }, [nameEn, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameEn.trim() || !nameFr.trim() || !nameRw.trim() || !slug.trim()) {
      setError(t('admin.errors.missingFields'));
      return;
    }
    setSaving(true);
    try {
      await upsertCategory({
        slug,
        name_en: nameEn,
        name_fr: nameFr,
        name_rw: nameRw,
        sort_order: 100,
      });
      setNameEn('');
      setNameFr('');
      setNameRw('');
      setSlug('');
      setSlugTouched(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('data.errorTitle'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-lg border border-border bg-card p-5 space-y-4"
    >
      <h2 className="text-h3 font-serif">{t('admin.addCategory')}</h2>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField id="cat-en" label={t('admin.name') + ' (EN)'}>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </FormField>
        <FormField id="cat-fr" label={t('admin.name') + ' (FR)'}>
          <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
        </FormField>
        <FormField id="cat-rw" label={t('admin.name') + ' (RW)'}>
          <Input value={nameRw} onChange={(e) => setNameRw(e.target.value)} />
        </FormField>
      </div>
      <FormField id="cat-slug" label={t('admin.slug')} hint={t('editor.slugHint')}>
        <Input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
      </FormField>
      <Button type="submit" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4" aria-hidden="true" />
        )}
        {t('admin.saveCategory')}
      </Button>
    </form>
  );
}

function CategoryRow({
  category,
  onDeleted,
}: {
  category: Category;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState(false);
  async function onDelete() {
    if (!window.confirm(t('admin.confirmDeleteCategory'))) return;
    setBusy(true);
    try {
      await deleteCategory(category.id);
      onDeleted();
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{category.name_en}</p>
        <p className="text-xs text-muted-foreground">
          {category.slug} · {category.name_fr} · {category.name_rw}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={busy}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
        {t('admin.delete')}
      </Button>
    </li>
  );
}
