import { describe, it, expect, beforeEach } from 'vitest';
import {
  initSimnet,
  deployContract,
  callPublicFn,
  callReadOnlyFn
} from './test-utils';

describe('Compliance Reporting Contract', () => {
  beforeEach(async () => {
    await initSimnet();
    await deployContract('waste-generator');
    await deployContract('collection-verification');
    await deployContract('treatment-certification');
    await deployContract('compliance-reporting');
    
    // Register a generator
    await callPublicFn('waste-generator', 'register-generator', [
      { type: 'string-utf8', value: 'General Hospital' },
      { type: 'string-utf8', value: '123 Medical Drive, City' },
      { type: 'string-utf8', value: 'MED12345' }
    ]);
    
    // Record a collection
    await callPublicFn('collection-verification', 'record-collection', [
      { type: 'uint', value: '1' }, // generator-id
      { type: 'string-utf8', value: 'Waste Management Inc.' }, // collector-name
      { type: 'string-utf8', value: 'Sharps' }, // waste-type
      { type: 'uint', value: '50' }, // quantity (in kg)
      { type: 'string-utf8', value: 'WM-TRUCK-123' } // transport-vehicle-id
    ]);
    
    // Record a treatment
    await callPublicFn('treatment-certification', 'record-treatment', [
      { type: 'uint', value: '1' }, // collection-id
      { type: 'string-utf8', value: 'EcoTreat Facility' }, // facility-name
      { type: 'string-utf8', value: 'Autoclave' }, // treatment-method
      { type: 'string-utf8', value: 'OP-789' } // operator-id
    ]);
  });
  
  it('should create a compliance report', async () => {
    const reportHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    const result = await callPublicFn('compliance-reporting', 'create-report', [
      { type: 'uint', value: '1' }, // generator-id
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // collection-ids
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // treatment-ids
      { type: 'string-utf8', value: 'EPA' }, // regulatory-body
      { type: 'buff', value: reportHash } // report-hash
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe('u1');
  });
  
  it('should submit a report', async () => {
    // First create a report
    const reportHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    await callPublicFn('compliance-reporting', 'create-report', [
      { type: 'uint', value: '1' }, // generator-id
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // collection-ids
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // treatment-ids
      { type: 'string-utf8', value: 'EPA' }, // regulatory-body
      { type: 'buff', value: reportHash } // report-hash
    ]);
    
    // Then submit it
    const submitResult = await callPublicFn('compliance-reporting', 'submit-report', [
      { type: 'uint', value: '1' }
    ]);
    
    expect(submitResult.success).toBe(true);
    
    // Check that it's submitted
    const report = await callReadOnlyFn('compliance-reporting', 'get-report', [
      { type: 'uint', value: '1' }
    ]);
    
    expect(report.success).toBe(true);
    expect(report.value.submitted).toBe(true);
  });
  
  it('should verify report integrity', async () => {
    // First create a report
    const reportHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    await callPublicFn('compliance-reporting', 'create-report', [
      { type: 'uint', value: '1' }, // generator-id
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // collection-ids
      { type: 'list', value: [{ type: 'uint', value: '1' }] }, // treatment-ids
      { type: 'string-utf8', value: 'EPA' }, // regulatory-body
      { type: 'buff', value: reportHash } // report-hash
    ]);
    
    // Verify with correct hash
    const correctVerifyResult = await callReadOnlyFn('compliance-reporting', 'verify-report-integrity', [
      { type: 'uint', value: '1' },
      { type: 'buff', value: reportHash }
    ]);
    
    expect(correctVerifyResult.success).toBe(true);
    expect(correctVerifyResult.value).toBe(true);
    
    // Verify with incorrect hash
    const wrongHash = '0x0000000000abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    const incorrectVerifyResult = await callReadOnlyFn('compliance-reporting', 'verify-report-integrity', [
      { type: 'uint', value: '1' },
      { type: 'buff', value: wrongHash }
    ]);
    
    expect(incorrectVerifyResult.success).toBe(true);
    expect(incorrectVerifyResult.value).toBe(false);
  });
});
