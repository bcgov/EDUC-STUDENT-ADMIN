import { setEmptyInputParams } from '@/utils/common';

describe('setEmptyInputParams', () => {  
  it('set null value given params with netsted object', () => {
    let params = {field1: 'value1', field2: { field: 'value2'}};
    setEmptyInputParams(params);
    expect(params.field1).toBeNull();
    expect(params.field2.field).toBeNull();
  });

  it('set null value given params and excluded field names', () => {
    let params = {field1: 'value1', field2: { field: 'value2'}};
    setEmptyInputParams(params, 'field2');
    expect(params.field1).toBeNull();
    expect(params.field2.field).not.toBeNull();
  });

  it('set null value given params and netsted excluded field names', () => {
    let params = {field1: 'value1', field2: { fieldA: 'valueA', fieldB: 'valueB'}};
    setEmptyInputParams(params, 'fieldA');
    expect(params.field1).toBeNull();
    expect(params.field2.fieldA).not.toBeNull();
    expect(params.field2.fieldB).toBeNull();
  });

});
