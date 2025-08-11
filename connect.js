const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
const bucketName = 'sessions';

async function saveSession(id) {
  if (!id.startsWith(config.PREFIX)) {
    throw new Error(`Prefix doesn't match check if "${config.PREFIX}" is correct`);
  }

  const sessionId = id.replace(config.PREFIX, "");
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(sessionId);

  if (error) throw error;

  const sessionDir = './session';
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const buffer = await data.arrayBuffer();
  fs.writeFileSync(path.join(sessionDir, 'creds.json'), Buffer.from(buffer));
}