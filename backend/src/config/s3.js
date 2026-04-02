const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;
const CDN    = process.env.CLOUDFRONT_URL; // ex: https://d1234.cloudfront.net

const ALLOWED_FOLDERS = new Set(['videos', 'thumbnails', 'avatars', 'partners']);
const EXT_MAP = {
  'video/mp4':  'mp4',
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
};

/**
 * Gera URL pré-assinada para upload direto do cliente → S3
 * O cliente faz PUT direto na AWS, sem passar pela API
 */
async function getUploadPresignedUrl({ folder, mimeType, expiresIn = 300 }) {
  const ext = EXT_MAP[mimeType];
  if (!ext) throw Object.assign(new Error('Tipo de arquivo não permitido.'), { status: 400 });
  if (!ALLOWED_FOLDERS.has(folder)) throw Object.assign(new Error('Pasta inválida.'), { status: 400 });
  const key  = `${folder}/${uuidv4()}.${ext}`;
  const cmd  = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: mimeType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return { uploadUrl: url, key, publicUrl: `${CDN}/${key}` };
}

/**
 * Gera URL pré-assinada para download privado (vídeos de trilha)
 */
async function getDownloadPresignedUrl(key, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

/**
 * Remove arquivo do S3
 */
async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { getUploadPresignedUrl, getDownloadPresignedUrl, deleteObject };
