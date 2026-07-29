import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { updateProfile } from '@/lib/data/users';
import type { Profile } from '@/types/database';

const BUCKET = 'avatars';
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function extensionFor(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

function assertImageFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Use a JPG, PNG, WebP, or GIF image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 2 MB or smaller.');
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

/** Upload a profile photo and save its public URL on the profile. */
export async function uploadProfileAvatar(
  userId: string,
  file: File,
): Promise<Profile> {
  assertImageFile(file);

  if (!isSupabaseConfigured) {
    const dataUrl = await readFileAsDataUrl(file);
    return updateProfile(userId, { avatar_url: dataUrl });
  }

  const ext = extensionFor(file.type);
  const path = `${userId}/avatar.${ext}`;
  const supabase = getSupabase();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  return updateProfile(userId, { avatar_url: publicUrl });
}

/** Clear the profile photo (and remove storage object when using Supabase). */
export async function removeProfileAvatar(userId: string): Promise<Profile> {
  if (!isSupabaseConfigured) {
    return updateProfile(userId, { avatar_url: null });
  }

  const supabase = getSupabase();
  const folder = `${userId}`;
  const { data: listed } = await supabase.storage.from(BUCKET).list(folder);
  const paths = (listed ?? []).map((obj) => `${folder}/${obj.name}`);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  return updateProfile(userId, { avatar_url: null });
}
