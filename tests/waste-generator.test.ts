import { describe, it, expect, beforeEach } from 'vitest';
import {
  initSimnet,
  deployContract,
  callPublicFn,
  callReadOnlyFn
} from './test-utils';

describe('Waste Generator Contract', () => {
  beforeEach(async () => {
    await initSimnet();
    await deployContract('waste-generator');
  });
  
  it('should register a new waste generator', async () => {
    const name = 'General Hospital';
    const address = '123 Medical Drive, City';
    const licenseNumber = 'MED12345';
    
    const result = await callPublicFn('waste-generator', 'register-generator', [
      { type: 'string-utf8', value: name },
      { type: 'string-utf8', value: address },
      { type: 'string-utf8', value: licenseNumber }
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe('u1');
  });
  
  it('should retrieve a registered generator', async () => {
    // First register a generator
    await callPublicFn('waste-generator', 'register-generator', [
      { type: 'string-utf8', value: 'General Hospital' },
      { type: 'string-utf8', value: '123 Medical Drive, City' },
      { type: 'string-utf8', value: 'MED12345' }
    ]);
    
    // Then retrieve it
    const result = await callReadOnlyFn('waste-generator', 'get-generator', [
      { type: 'uint', value: '1' }
    ]);
    
    expect(result.success).toBe(true);
    const generator = result.value;
    expect(generator.name).toBe('General Hospital');
    expect(generator.active).toBe(true);
  });
  
  it('should deactivate a generator', async () => {
    // First register a generator
    await callPublicFn('waste-generator', 'register-generator', [
      { type: 'string-utf8', value: 'General Hospital' },
      { type: 'string-utf8', value: '123 Medical Drive, City' },
      { type: 'string-utf8', value: 'MED12345' }
    ]);
    
    // Then deactivate it
    const deactivateResult = await callPublicFn('waste-generator', 'deactivate-generator', [
      { type: 'uint', value: '1' }
    ]);
    
    expect(deactivateResult.success).toBe(true);
    
    // Verify it's deactivated
    const checkResult = await callReadOnlyFn('waste-generator', 'is-generator-active', [
      { type: 'uint', value: '1' }
    ]);
    
    expect(checkResult.success).toBe(true);
    expect(checkResult.value).toBe(false);
  });
});
