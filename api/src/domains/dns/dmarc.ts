/**
 * DMARC (Domain-based Message Authentication, Reporting & Conformance) Verification
 *
 * DMARC ties together SPF and DKIM, specifying what to do with failures
 * and where to send reports.
 */

import { promises as dns } from 'dns';

export interface DmarcVerificationResult {
  valid: boolean;
  record: string | null;
  reason: string;
  policy: 'none' | 'quarantine' | 'reject' | null;
  reportingEnabled: boolean;
}

export interface DmarcPolicy {
  version: string;
  policy: 'none' | 'quarantine' | 'reject';
  subdomainPolicy?: 'none' | 'quarantine' | 'reject';
  percentage?: number;
  ruaEmail?: string; // Aggregate reports
  rufEmail?: string; // Forensic reports
  alignmentMode?: 'relaxed' | 'strict';
}

/**
 * Verify DMARC record for a domain
 */
export async function verifyDmarc(
  domain: string,
): Promise<DmarcVerificationResult> {
  const recordName = `_dmarc.${domain}`;

  try {
    const records = await dns.resolveTxt(recordName);

    // Flatten TXT records
    const txtRecords = records.map((chunks) => chunks.join(''));

    // Find DMARC record
    const dmarcRecord = txtRecords.find((record) =>
      record.toLowerCase().startsWith('v=dmarc1'),
    );

    if (!dmarcRecord) {
      return {
        valid: false,
        record: null,
        reason: `No DMARC record found at ${recordName}. Add a TXT record with v=DMARC1.`,
        policy: null,
        reportingEnabled: false,
      };
    }

    // Parse the DMARC record
    const parsed = parseDmarcRecord(dmarcRecord);

    if (!parsed) {
      return {
        valid: false,
        record: dmarcRecord,
        reason: 'DMARC record found but could not be parsed. Check the format.',
        policy: null,
        reportingEnabled: false,
      };
    }

    // Check policy
    if (parsed.policy === 'none') {
      return {
        valid: true, // technically valid, but weak
        record: dmarcRecord,
        reason:
          'DMARC record found with p=none (monitoring mode). Consider using p=quarantine or p=reject for better protection.',
        policy: 'none',
        reportingEnabled: !!parsed.ruaEmail || !!parsed.rufEmail,
      };
    }

    return {
      valid: true,
      record: dmarcRecord,
      reason: `DMARC record is correctly configured with p=${parsed.policy}.`,
      policy: parsed.policy,
      reportingEnabled: !!parsed.ruaEmail || !!parsed.rufEmail,
    };
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return {
        valid: false,
        record: null,
        reason: `No DMARC record found at _dmarc.${domain}. Add a TXT record to enable DMARC.`,
        policy: null,
        reportingEnabled: false,
      };
    }

    return {
      valid: false,
      record: null,
      reason: `DNS lookup failed: ${error.message}`,
      policy: null,
      reportingEnabled: false,
    };
  }
}

/**
 * Parse a DMARC record string into structured data
 */
function parseDmarcRecord(record: string): DmarcPolicy | null {
  try {
    const parts = record.split(';').map((p) => p.trim());

    const result: DmarcPolicy = {
      version: 'DMARC1',
      policy: 'none',
    };

    for (const part of parts) {
      const [key, value] = part.split('=').map((s) => s.trim().toLowerCase());

      switch (key) {
        case 'v':
          result.version = value.toUpperCase();
          break;
        case 'p':
          if (
            value === 'none' ||
            value === 'quarantine' ||
            value === 'reject'
          ) {
            result.policy = value;
          }
          break;
        case 'sp':
          if (
            value === 'none' ||
            value === 'quarantine' ||
            value === 'reject'
          ) {
            result.subdomainPolicy = value;
          }
          break;
        case 'pct':
          result.percentage = parseInt(value, 10);
          break;
        case 'rua':
          result.ruaEmail = value.replace('mailto:', '');
          break;
        case 'ruf':
          result.rufEmail = value.replace('mailto:', '');
          break;
        case 'adkim':
        case 'aspf':
          result.alignmentMode = value === 's' ? 'strict' : 'relaxed';
          break;
      }
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Generate a recommended DMARC record for a domain
 */
export function generateDmarcRecord(
  reportEmail: string,
  policy: 'none' | 'quarantine' | 'reject' = 'quarantine',
): string {
  return `v=DMARC1; p=${policy}; rua=mailto:${reportEmail}; fo=1`;
}

/**
 * Get DMARC setup instructions
 */
export function getDmarcSetupInstructions(
  domain: string,
  reportEmail?: string,
): { name: string; value: string; explanation: string } {
  const email = reportEmail || `dmarc@${domain}`;

  return {
    name: `_dmarc.${domain}`,
    value: `v=DMARC1; p=quarantine; rua=mailto:${email}; fo=1`,
    explanation: `
      v=DMARC1 - DMARC version
      p=quarantine - Policy for failed emails (quarantine = spam folder)
      rua=mailto:${email} - Email to receive aggregate reports
      fo=1 - Generate reports on any SPF or DKIM failure
    `.trim(),
  };
}
