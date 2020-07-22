import { shallowMount } from '@vue/test-utils';
const { LocalDate } = require('@js-joda/core');
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../../../../../src/store/index';
import StudentAdvancedSearch from '../../../../../src/components/penreg/student-search/StudentAdvancedSearch';

describe('formattedStartDOB', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;

  beforeEach(() => {

    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      computed: {
        formattedEndDOB() {
          return undefined;
        }
      },
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should have same start date if there is a complete start date', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: '04'
      }
    });
    expect(wrapper.vm.formattedStartDOB).toEqual('1990/07/04');
  });
  it('Should set day to 01 if no day', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: null
      }
    });
    expect(wrapper.vm.formattedStartDOB).toEqual('1990/07/01');
  });
  it('Should set day and month to 01 if not provided', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: null,
        day: null
      }
    });
    expect(wrapper.vm.formattedStartDOB).toEqual('1990/01/01');
  });
  it('Should return null if no date', () => {
    wrapper.setData({
      startDOB: {
        year: null,
        month: null,
        day: null
      },
    });
    expect(wrapper.vm.formattedStartDOB).toBe(null);
  });
});

describe('formattedEndDOB', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;

  beforeEach(() => {

    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      computed: {
        formattedStartDOB() {
          return '1990/01/02';
        }
      },
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should have same end date if there is a complete start date', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      useDOBRange: true
    });
    expect(wrapper.vm.formattedEndDOB).toEqual('1990/07/04');
  });
  it('Should set day to 31 if no day', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.formattedEndDOB).toEqual('1990/07/31');
  });
  it('Should set day to 31 and month to 12 if not provided', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.formattedEndDOB).toEqual('1990/12/31');
  });
  it('Should have same as start date if useDOBRange is false', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      startDOB: {
        year: '1990',
        month: '01',
        day: '03'
      },
      useDOBRange: false,
      isValidStartDOB: {
        year: true,
        month: true,
        day: true
      }
    });
    expect(wrapper.vm.formattedEndDOB).toEqual('1990/01/02');
  });
});

describe('validateDOBPast', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if all params null', () => {
    expect(wrapper.vm.validateDOBPast()).toBeTruthy();
  });
  it('Should be false if one param null', () => {
    expect(wrapper.vm.validateDOBPast('1990', '07')).toBeFalsy();
  });
  it('Should be false if date greater than current date', () => {
    expect(wrapper.vm.validateDOBPast('2020', '07', '22')).toBeFalsy();
  });
  it('Should be true if date before current date', () => {
    expect(wrapper.vm.validateDOBPast('2020', '07', '21')).toBeTruthy();
  });
});

describe('validateDOBYear', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if all params null', () => {
    expect(wrapper.vm.validateDOBYear()).toEqual([]);
  });
  it('Should return invalid if param not 4 digits', () => {
    expect(wrapper.vm.validateDOBYear('199t')).toEqual(['Invalid year']);
  });
  it('Should be date error if date greater than current date', () => {
    expect(wrapper.vm.validateDOBYear('2021')).toEqual(['DOB must be in the past']);
  });
  it('Should be true if date before current date', () => {
    expect(wrapper.vm.validateDOBYear('2020')).toEqual([]);
  });
});

describe('validateStartDOBYear', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if all params null', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateStartDOBYear()).toEqual([]);
  });
  it('Should return invalid date is not valid', () => {
    wrapper.setData({
      startDOB: {
        year: '199',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateStartDOBYear()).toEqual(['Invalid year']);
  });
  it('Should be true if date before current date', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateStartDOBYear()).toEqual([]);
  });
});
describe('validateEndDOBYear', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return year required error if end year is null', () => {
    wrapper.setData({
      useDOBRange: true
    });
    expect(wrapper.vm.validateEndDOBYear()).toEqual(['Year required for range search']);
  });
  it('Should return true if is valid end year and useDOBRange is null', () => {
    expect(wrapper.vm.validateEndDOBYear()).toEqual([]);
  });
  it('Should return end date error if end date greater than start date is not valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: null,
        day: null
      },
      startDOB: {
        year: '1995',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateEndDOBYear()).toEqual(['End Date must be the same as or later than the Start Date']);
  });
  it('Should return invalid error if date is not valid', () => {
    wrapper.setData({
      endDOB: {
        year: '199',
        month: null,
        day: null
      },
      startDOB: {
        year: '1995',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateEndDOBYear()).toEqual(['Invalid year']);
  });
  it('Should return true', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: null,
        day: null
      },
      startDOB: {
        year: '1985',
        month: null,
        day: null
      },
      useDOBRange: true
    });
    expect(wrapper.vm.validateEndDOBYear()).toEqual([]);
  });
});

describe('validateStartDOBMonth', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if month null', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: null,
        day: null
      },
      isValidStartDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateStartDOBMonth()).toEqual([]);
  });
  it('Should return true if year is invalid', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      isValidStartDOB: {
        year: false
      }
    });
    expect(wrapper.vm.validateStartDOBMonth()).toEqual([]);
  });
  it('Should return invalid if month is not valid', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '13',
        day: null
      },
      isValidStartDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateStartDOBMonth()).toEqual(['Invalid month']);
  });
  it('Should be true if date before current date', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      isValidStartDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateStartDOBMonth()).toEqual([]);
  });
  it('Should be invalid if date after current date', () => {
    wrapper.setData({
      startDOB: {
        year: '2020',
        month: '08',
        day: null
      },
      isValidStartDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateStartDOBMonth()).toEqual(['DOB must be in the past']);
  });
});

describe('validateEndDOBMonth', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if month null', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: null,
        day: null
      },
      isValidEndDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual([]);
  });
  it('Should return true if year is invalid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      isValidEndDOB: {
        year: false
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual([]);
  });
  it('Should return true if start month is null and end date valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '12',
        day: null
      },
      startDOB: {
        year: '1990',
        month: null,
        day: null
      },
      isValidEndDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual([]);
  });
  it('Should return true if start month is valid and end date valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '12',
        day: null
      },
      startDOB: {
        year: '1990',
        month: '01',
        day: null
      },
      isValidEndDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual([]);
  });
  it('Should return invalid if month is not valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '13',
        day: null
      },
      isValidEndDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual(['Invalid month']);
  });
  it('Should be invalid if end date date before start date', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      startDOB: {
        year: '1990',
        month: '08',
        day: null
      },
      isValidEndDOB: {
        year: true
      }
    });
    expect(wrapper.vm.validateEndDOBMonth()).toEqual(['End Date must be the same as or later than the Start Date']);
  });
});
describe('validateStartDOBDay', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if day null', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      isValidStartDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateStartDOBDay()).toEqual([]);
  });
  it('Should return true if month is invalid', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      isValidStartDOB: {
        year: true,
        month: false
      }
    });
    expect(wrapper.vm.validateStartDOBDay()).toEqual([]);
  });
  it('Should return invalid if day is not valid', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: '32'
      },
      isValidStartDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateStartDOBDay()).toEqual(['Invalid day']);
  });
  it('Should be true if date before current date', () => {
    wrapper.setData({
      startDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      isValidStartDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateStartDOBDay()).toEqual([]);
  });
  it('Should be invalid if date after current date', () => {
    wrapper.setData({
      startDOB: {
        year: '2020',
        month: '07',
        day: '23'
      },
      isValidStartDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateStartDOBDay()).toEqual(['DOB must be in the past']);
  });
});

describe('validateEndDOBDay', () => {

  let props = {
    enterPushed: () => { return []; },
    runPENSearchIfPossible: () => { return []; },
    searchHasValues: () => { return []; },
    validatePen: () => { return []; },
    uppercaseGender: () => { return []; },
    uppercaseGrade: () => { return []; },
    validateGender: () => { return []; },
    validateMincode: () => { return []; },
    uppercasePostal: () => { return []; },
    validatePostal: () => { return []; },
    validateGradeCode: () => { return []; }
  };
  let wrapper;
  jest.spyOn(LocalDate, 'now');

  beforeEach(() => {
    LocalDate.now.mockReturnValue(LocalDate.of('2020', '07', '22'));
    Vue.use(Vuetify);
    Vue.use(Vuex);
    wrapper = shallowMount(StudentAdvancedSearch, {
      propsData: props,
      Vue,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('Should return true if day null', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      isValidEndDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual([]);
  });
  it('Should return true if month is invalid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      isValidEndDOB: {
        year: true,
        month: false
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual([]);
  });
  it('Should return true if start day is null and end date valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      startDOB: {
        year: '1990',
        month: '07',
        day: null
      },
      isValidEndDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual([]);
  });
  it('Should return true if start month is valid and end date valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      startDOB: {
        year: '1990',
        month: '01',
        day: '02'
      },
      isValidEndDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual([]);
  });
  it('Should return invalid if day is not valid', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '32'
      },
      isValidEndDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual(['Invalid day']);
  });
  it('Should be invalid if end date date before start date', () => {
    wrapper.setData({
      endDOB: {
        year: '1990',
        month: '07',
        day: '04'
      },
      startDOB: {
        year: '1990',
        month: '07',
        day: '05'
      },
      isValidEndDOB: {
        year: true,
        month: true
      }
    });
    expect(wrapper.vm.validateEndDOBDay()).toEqual(['End Date must be the same as or later than the Start Date']);
  });
});
