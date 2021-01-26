import { isNotEmptyInputParams } from '@/utils/validation';

describe('isNotEmptyInputParams', () => {  
  it('return true given object with values', () => {
    expect(isNotEmptyInputParams({field1: null, field2: 'value2'})).toBeTruthy();
    expect(isNotEmptyInputParams({field1: null, field2: { field1: null, field2: 'value2'}})).toBeTruthy();
  });

  it('return false given object with null values', () => {
    expect(isNotEmptyInputParams({field1: null, field2: null})).toBeFalsy();
    expect(isNotEmptyInputParams({field1: null, field2: { field1: null, field2: null}})).toBeFalsy();
  });

});
