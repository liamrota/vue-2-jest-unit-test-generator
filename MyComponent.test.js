import { mount, createLocalVue } from '@vue/test-utils';
import MyComponent from '../MyComponent';

let wrapper;
const options = {};
describe('MyComponent', () => {
  beforeEach(() => {
    wrapper = shallowMount(MyComponent, options);
  });
  
  it('Is a vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('Matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  // #FurtherTests#
});
