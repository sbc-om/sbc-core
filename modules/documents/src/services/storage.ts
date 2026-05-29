import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type StorageDriver = "local" | "s3";

export interface StoredObject {
  storagePath: string;
}

interface StorageBackend {
  ensureReady(): Promise<void>;
  putObject(key: string, bytes: Buffer, mimeType: string): Promise<StoredObject>;
  getObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
}

function getStorageDriver(): StorageDriver {
  const configured = process.env["STORAGE_DRIVER"]?.trim().toLowerCase();
  if (configured === "s3") return "s3";
  if (configured === "local") return "local";

  return process.env["STORAGE_ENDPOINT"] ? "s3" : "local";
}

function getStorageRoot(): string {
  const configured = process.env["FILE_STORAGE_ROOT"]?.trim();
  if (!configured) {
    return path.resolve(process.cwd(), ".storage", "files");
  }

  return path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured);
}

class LocalStorageBackend implements StorageBackend {
  async ensureReady(): Promise<void> {
    await mkdir(getStorageRoot(), { recursive: true });
  }

  async putObject(key: string, bytes: Buffer): Promise<StoredObject> {
    const storagePath = path.join(getStorageRoot(), ...key.split("/"));
    await mkdir(path.dirname(storagePath), { recursive: true });
    await writeFile(storagePath, bytes);

    return { storagePath };
  }

  async getObject(key: string): Promise<Buffer> {
    const storagePath = path.join(getStorageRoot(), ...key.split("/"));
    return readFile(storagePath);
  }

  async deleteObject(key: string): Promise<void> {
    const storagePath = path.join(getStorageRoot(), ...key.split("/"));
    await unlink(storagePath);
  }
}

function getS3Config() {
  const endpoint = process.env["STORAGE_ENDPOINT"]?.trim();
  const accessKeyId = process.env["STORAGE_ACCESS_KEY"]?.trim();
  const secretAccessKey = process.env["STORAGE_SECRET_KEY"]?.trim();
  const bucket = process.env["STORAGE_BUCKET"]?.trim();
  const region = process.env["STORAGE_REGION"]?.trim() || "us-east-1";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("S3 storage requires STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, and STORAGE_BUCKET");
  }

  return {
    endpoint,
    bucket,
    region,
    client: new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  };
}

class S3StorageBackend implements StorageBackend {
  private readonly config = getS3Config();
  private readyPromise: Promise<void> | null = null;

  async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.ensureBucket();
    }

    await this.readyPromise;
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.config.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
    } catch {
      await this.config.client.send(
        new CreateBucketCommand({
          Bucket: this.config.bucket,
        })
      );
    }
  }

  async putObject(key: string, bytes: Buffer, mimeType: string): Promise<StoredObject> {
    await this.config.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: bytes,
        ContentType: mimeType,
      })
    );

    return {
      storagePath: `s3://${this.config.bucket}/${key}`,
    };
  }

  async getObject(key: string): Promise<Buffer> {
    const response = await this.config.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      throw new Error(`Stored object ${key} is empty or unavailable`);
    }

    return Buffer.from(bytes);
  }

  async deleteObject(key: string): Promise<void> {
    await this.config.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })
    );
  }
}

let storageBackend: StorageBackend | null = null;

function getBackend(): StorageBackend {
  if (!storageBackend) {
    storageBackend = getStorageDriver() === "s3"
      ? new S3StorageBackend()
      : new LocalStorageBackend();
  }

  return storageBackend;
}

export async function ensureStorageReady(): Promise<void> {
  await getBackend().ensureReady();
}

export async function storeObject(key: string, bytes: Buffer, mimeType: string): Promise<StoredObject> {
  await ensureStorageReady();
  return getBackend().putObject(key, bytes, mimeType);
}

export async function readObject(key: string): Promise<Buffer> {
  await ensureStorageReady();
  return getBackend().getObject(key);
}

export async function removeObject(key: string): Promise<void> {
  await ensureStorageReady();
  return getBackend().deleteObject(key);
}

export function getConfiguredStorageDriver(): StorageDriver {
  return getStorageDriver();
}