import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = 'https://ipubxjvddtkiyxdxmgfi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aFdyt7WE8-dQBCY0zigFgg_VjaWTSD1';
const BUCKET = 'nendoroid-images';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/images');
const JSON_PATH = path.join(__dirname, '../src/data/nendoroids.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const files = (await fs.readdir(IMAGES_DIR)).filter(f => f.endsWith('.png'));
  console.log(`Uploading ${files.length} images to Supabase Storage bucket "${BUCKET}"...`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const buffer = await fs.readFile(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, buffer, { contentType: 'image/png', upsert: false });

    if (error) {
      if (error.message?.includes('already exists') || error.statusCode === '409') {
        skipped++;
      } else {
        console.error(`  FAILED: ${file} — ${error.message}`);
        failed++;
      }
    } else {
      uploaded++;
    }

    if ((uploaded + skipped + failed) % 100 === 0) {
      console.log(`  Progress: ${uploaded + skipped + failed}/${files.length} (${uploaded} uploaded, ${skipped} skipped, ${failed} failed)`);
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} already existed, ${failed} failed`);

  // Update nendoroids.json to use Supabase public URLs
  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
  const data = JSON.parse(await fs.readFile(JSON_PATH, 'utf-8'));

  let updated = 0;
  for (const nendo of data) {
    if (nendo.image?.startsWith('/images/')) {
      const filename = path.basename(nendo.image);
      nendo.image = `${baseUrl}/${filename}`;
      updated++;
    }
  }

  await fs.writeFile(JSON_PATH, JSON.stringify(data, null, 2));
  console.log(`Updated ${updated} image URLs in nendoroids.json`);
}

main().catch(console.error);
