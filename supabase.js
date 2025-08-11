const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const crypto = require('crypto');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
const bucketName = 'sessions';

async function uploadSession(sessionDir) {
    const files = fs.readdirSync(sessionDir);
    const sessionId = crypto.randomBytes(8).toString('hex');
    
    // Upload all session files
    for (const file of files) {
        const filePath = path.join(sessionDir, file);
        const fileContent = fs.readFileSync(filePath);
        
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(`${sessionId}/${file}`, fileContent);
        
        if (error) throw error;
    }
    
    return sessionId;
}

async function downloadSession(sessionId, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(sessionId);

    if (error) throw error;

    for (const file of files) {
        const { data, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(`${sessionId}/${file.name}`);
        
        if (downloadError) throw downloadError;
        
        const buffer = await data.arrayBuffer();
        fs.writeFileSync(path.join(outputDir, file.name), Buffer.from(buffer));
    }
}

module.exports = { uploadSession, downloadSession };