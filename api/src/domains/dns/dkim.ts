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
/**
 * Verify DKIM record for a domain
 */
export async function verifyDkim(
  domain: string,
  selectors: string | string[] = DEFAULT_SELECTOR,
): Promise<DkimVerificationResult> {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];
  const results: string[] = [];
  let allValid = true;

  for (const selector of selectorList) {
    const recordName = `${selector}._domainkey.${domain}`;
    let recordFound = false;

    // First, try CNAME lookup (preferred for managed DKIM)
    try {
      const cnameRecords = await dns.resolveCname(recordName);
      if (cnameRecords.length > 0) {
        results.push(`[${selector}] CNAME found: ${cnameRecords[0]}`);
        recordFound = true;
      }
    } catch {
      // CNAME not found, try TXT
    }

    if (!recordFound) {
      // Try TXT record lookup
      try {
        const txtRecords = await dns.resolveTxt(recordName);
        const txtRecord = txtRecords.map((chunks) => chunks.join('')).join('');

        if (txtRecord) {
          // Check for valid DKIM format
          if (!txtRecord.includes('v=DKIM1') && !txtRecord.includes('p=')) {
            results.push(`[${selector}] Invalid TXT format`);
            allValid = false;
          } else {
            results.push(`[${selector}] TXT found`);
            recordFound = true;
          }
        }
      } catch (error: any) {
        // Not found
      }
    }

    if (!recordFound) {
      results.push(`[${selector}] Missing record`);
      allValid = false;
    }
  }

  if (allValid) {
    return {
      valid: true,
      selector: selectorList.join(','),
      record: 'Multiple records checked',
      reason: 'All DKIM records are correctly configured.',
      recordType: 'CNAME',
    };
  }

  return {
    valid: false,
    selector: selectorList.join(','),
    record: null,
    reason: `Missing or invalid DKIM records: ${results.filter((r) => r.includes('Missing') || r.includes('Invalid')).join(', ')}`,
    recordType: null,
  };
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
  const cnameTarget = `${selector}._domainkey.dkim.inverx.pro`;

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
      value: `${selector}._domainkey.dkim.inverx.pro`,
    },
    txt: {
      name: `${selector}._domainkey.${domain}`,
      value: 'v=DKIM1; k=rsa; p=<your-public-key>',
    },
  };
}
