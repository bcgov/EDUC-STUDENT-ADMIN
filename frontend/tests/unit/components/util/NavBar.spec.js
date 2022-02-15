import { mount, createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import NavBar from '@/components/util/NavBar.vue';
import VueRouter from 'vue-router';

describe('NavBar Component initialized with namespaced Vuex module.\'', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(VueRouter);
  Vue.use(Vuetify);
  Vue.use(Vuex);

  const router = new VueRouter();
  const vuetify = new Vuetify();

  const  store = new Vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        state: {
          isAuthorizedUser: true,
          isValidStudentSearchUser: true,
          isValidNominalRollReadOnly: true,
          isValidPenRequestBatchUser: true,
          isValidStaffAdministrationUser: true
        }
      },
      setNavigation: {
        namespaced: true,
        state: {
          selectedIDs: {},
          currentRequest: 0,
          archived: false
        }
      }
    }
  });

  const title = 'Title Text';

  beforeEach(() => {
    wrapper = mount(NavBar, {
      sync: false,
      localVue,
      vuetify,
      store,
      router,
      propsData: {
        title: title
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  test('It should render the component and display title prop.', () => {
    const titleElement = wrapper.find('.v-toolbar__title');
    expect(titleElement.text()).toBe('Title Text');
  });

  test('Should set active icon fas-minus-circle', async () => {
    const dummyItem = {
      title: 'Home',
      active: false,
      authorized: true,
      items: [
        {
          title: 'child1',
          authorized: true
        },
        {
          title: 'child2',
          authorized: true
        }
      ],
    };

    wrapper.setData({
      items: [dummyItem]
    });
    await wrapper.vm.setActive(dummyItem);
    const expandIcon = wrapper.findAll('.v-list-group__header > i').at(0);
    expect(expandIcon.classes()).toContain('mdi-minus');
  });

  test('Should set active icon fas-plus-circle', async () => {
    const dummyItem = {
      title: 'Home',
      active: true,
      authorized: true,
      items: [
        {
          title: 'child1',
          authorized: true
        },
        {
          title: 'child2',
          authorized: true
        }
      ],
    };

    wrapper.setData({
      items: [dummyItem]
    });
    await wrapper.vm.setActive(dummyItem);
    const expandIcon = wrapper.findAll('.v-list-group__header > i').at(0);
    expect(expandIcon.classes()).toContain('mdi-plus');
  });
});
