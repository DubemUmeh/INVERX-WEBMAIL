/**
 * DKIM (DomainKeys Identified Mail) Verification
 *
 * DKIM uses public key cryptography to sign emails.
 * We check for a CNAME or TXT record at selector._domainkey.domain
 */

import { promises as dns } from 'dns';
import { generateKeyPairSync, randomBytes } from 'crypto';

export interface DkimVerificationResult {
  valid: boolean;
  selector: string;
  record: string | null;
  reason: string;
  recordType: 'CNAME' | 'TXT' | null;
}

export interface DkimKeyPair {
  selector: string;
  publicKey: string;
  privateKey: string;
  dnsRecord: string;
  cnameTarget: string;
}

// Default selector for InverX
const DEFAULT_SELECTOR = 'inverx';

/**
 * Verify DKIM record for a domain
 */
export async function verifyDkim(
  domain: string,
  selector: string = DEFAULT_SELECTOR,
): Promise<DkimVerificationResult> {
  const recordName = `${selector}._domainkey.${domain}`;

  // First, try CNAME lookup (preferred for managed DKIM)
  try {
    const cnameRecords = await dns.resolveCname(recordName);

    if (cnameRecords.length > 0) {
      const cnameTarget = cnameRecords[0];

      // Check if it points to InverX
      if (cnameTarget.toLowerCase().includes('inverx')) {
        return {
          valid: true,
          selector,
          record: cnameTarget,
          reason: 'DKIM CNAME record correctly points to InverX.',
          recordType: 'CNAME',
        };
      }

      return {
        valid: false,
        selector,
        record: cnameTarget,
        reason: `DKIM CNAME found but points to ${cnameTarget}, not InverX.`,
        recordType: 'CNAME',
      };
    }
  } catch {
    // CNAME not found, try TXT
  }

  // Try TXT record lookup
  try {
    const txtRecords = await dns.resolveTxt(recordName);
    const txtRecord = txtRecords.map((chunks) => chunks.join('')).join('');

    if (!txtRecord) {
      return {
        valid: false,
        selector,
        record: null,
        reason: `No DKIM record found at ${recordName}. Add a CNAME or TXT record.`,
        recordType: null,
      };
    }

    // Check for valid DKIM format
    if (!txtRecord.includes('v=DKIM1') && !txtRecord.includes('p=')) {
      return {
        valid: false,
        selector,
        record: txtRecord,
        reason:
          'DKIM record found but format is invalid. Must contain v=DKIM1 and p= (public key).',
        recordType: 'TXT',
      };
    }

    // Check if it's our public key (simplified check)
    // In production, you'd compare against stored public key
    if (txtRecord.includes('p=')) {
      return {
        valid: true,
        selector,
        record: txtRecord,
        reason: 'DKIM TXT record is correctly configured.',
        recordType: 'TXT',
      };
    }

    return {
      valid: false,
      selector,
      record: txtRecord,
      reason: 'DKIM record format is invalid.',
      recordType: 'TXT',
    };
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return {
        valid: false,
        selector,
        record: null,
        reason: `No DKIM record found at ${recordName}. Add the required DNS record.`,
        recordType: null,
      };
    }

    return {
      valid: false,
      selector,
      record: null,
      reason: `DNS lookup failed: ${error.message}`,
      recordType: null,
    };
  }
}

/**
 * Generate a DKIM key pair for a domain
 * Returns both public and private keys, plus the DNS record value
 */
export function generateDkimKeyPair(domain: string): DkimKeyPair {
  const selector = `inverx-${randomBytes(4).toString('hex')}`;

  // Generate RSA key pair (2048-bit is standard for DKIM)
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Extract the base64-encoded public key (remove PEM headers)
  const publicKeyBase64 = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\n/g, '')
    .trim();

  // Create DKIM TXT record value
  const dnsRecord = `v=DKIM1; k=rsa; p=${publicKeyBase64}`;

  // CNAME target for managed DKIM
  const cnameTarget = `${selector}._domainkey.dkim.inverx.com`;

  return {
    selector,
    publicKey,
    privateKey,
    dnsRecord,
    cnameTarget,
  };
}

/**
 * Get the recommended DKIM DNS setup for a domain
 */
export function getDkimSetupInstructions(
  domain: string,
  selector: string = DEFAULT_SELECTOR,
): {
  cname: { name: string; value: string };
  txt: { name: string; value: string };
} {
  return {
    cname: {
      name: `${selector}._domainkey.${domain}`,
      value: `${selector}._domainkey.dkim.inverx.com`,
    },
    txt: {
      name: `${selector}._domainkey.${domain}`,
      value: 'v=DKIM1; k=rsa; p=<your-public-key>',
    },
  };
}
