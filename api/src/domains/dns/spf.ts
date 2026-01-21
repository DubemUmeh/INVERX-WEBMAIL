/**
 * SPF (Sender Policy Framework) Verification
 *
 * SPF validates that mail servers are authorized to send email for a domain.
 * We check for a TXT record containing "v=spf1" with our service included.
 */

import { promises as dns } from 'dns';

export interface SpfVerificationResult {
  valid: boolean;
  record: string | null;
  reason: string;
  includesInverx: boolean;
}

/**
 * Expected SPF record format for InverX:
 * v=spf1 include:_spf.inverx.com ~all
 * or
 * v=spf1 include:_spf.inverx.com -all
 */
const INVERX_SPF_INCLUDE = 'include:_spf.inverx.com';

export async function verifySpf(
  domain: string,
): Promise<SpfVerificationResult> {
  try {
    const records = await dns.resolveTxt(domain);

    // Flatten TXT records (they can be chunked)
    const txtRecords = records.map((chunks) => chunks.join(''));

    // Find SPF record
    const spfRecord = txtRecords.find((record) =>
      record.toLowerCase().startsWith('v=spf1'),
    );

    if (!spfRecord) {
      return {
        valid: false,
        record: null,
        reason: 'No SPF record found. Add a TXT record with your SPF policy.',
        includesInverx: false,
      };
    }

    // Check if InverX is included
    const includesInverx = spfRecord
      .toLowerCase()
      .includes(INVERX_SPF_INCLUDE.toLowerCase());

    if (!includesInverx) {
      return {
        valid: false,
        record: spfRecord,
        reason: `SPF record found but does not include InverX. Add "${INVERX_SPF_INCLUDE}" to your SPF record.`,
        includesInverx: false,
      };
    }

    // Check for valid mechanism at the end
    const hasValidMechanism =
      spfRecord.includes('~all') ||
      spfRecord.includes('-all') ||
      spfRecord.includes('?all');

    if (!hasValidMechanism) {
      return {
        valid: false,
        record: spfRecord,
        reason: 'SPF record should end with ~all, -all, or ?all mechanism.',
        includesInverx: true,
      };
    }

    return {
      valid: true,
      record: spfRecord,
      reason: 'SPF record is correctly configured.',
      includesInverx: true,
    };
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return {
        valid: false,
        record: null,
        reason: 'No DNS records found for this domain.',
        includesInverx: false,
      };
    }

    return {
      valid: false,
      record: null,
      reason: `DNS lookup failed: ${error.message}`,
      includesInverx: false,
    };
  }
}

/**
 * Generate the required SPF record for a domain
 */
export function generateSpfRecord(existingSpf?: string): string {
  if (!existingSpf) {
    return `v=spf1 ${INVERX_SPF_INCLUDE} ~all`;
  }

  // If there's an existing SPF record, suggest adding our include
  // This is a simplified version - real implementation would parse properly
  if (existingSpf.toLowerCase().includes(INVERX_SPF_INCLUDE.toLowerCase())) {
    return existingSpf; // Already includes InverX
  }

  // Insert our include before the mechanism
  const mechanismMatch = existingSpf.match(/(\s[~\-\?]all)/i);
  if (mechanismMatch) {
    return existingSpf.replace(
      mechanismMatch[0],
      ` ${INVERX_SPF_INCLUDE}${mechanismMatch[0]}`,
    );
  }

  // If no mechanism found, append
  return `${existingSpf} ${INVERX_SPF_INCLUDE} ~all`;
}
