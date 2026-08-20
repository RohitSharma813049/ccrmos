import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TenantKey from '@/modules/core/schemas/TenantKey';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { generateNewDEK, encryptData } from '@/lib/encryption';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // Only Founders or System Admins can rotate cryptographic keys
    if (user.role?.name !== 'Founder') {
      return NextResponse.json({ error: "Unauthorized. Only Founders can rotate E2EE keys." }, { status: 403 });
    }

    await dbConnect();

    // 1. In a production environment, the Master Key is managed by AWS KMS or HashiCorp Vault.
    // For this architecture, we use a 32-byte MASTER_SECRET from the .env file.
    const masterSecretString = process.env.NEXTAUTH_SECRET || "fallback_master_secret_key_32_byte";
    const masterKey = crypto.createHash('sha256').update(masterSecretString).digest();

    // 2. Deactivate the current active key
    const currentKey = await TenantKey.findOne({ companyId: user.companyId, isActive: true });
    let newVersion = 1;
    
    if (currentKey) {
      currentKey.isActive = false;
      await currentKey.save();
      newVersion = currentKey.keyVersion + 1;
    }

    // 3. Generate a brand new Data Encryption Key (DEK) for the tenant
    const newDek = generateNewDEK();

    // 4. Wrap (Encrypt) the new DEK using the System Master Key
    // We convert the DEK buffer to a hex string so it can be encrypted by the master key
    const wrappedDekPayload = encryptData(newDek.toString('hex'), masterKey);

    // 5. Save the new wrapped DEK to the database
    const newTenantKey = await TenantKey.create({
      companyId: user.companyId,
      encryptedDEK: wrappedDekPayload.ciphertext,
      iv: wrappedDekPayload.iv,
      authTag: wrappedDekPayload.authTag,
      keyVersion: newVersion,
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      message: "Cryptographic keys successfully rotated",
      keyVersion: newTenantKey.keyVersion
    });

  } catch (error: any) {
    console.error("Key Rotation Error:", error);
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
