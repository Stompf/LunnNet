import { LunnNetPage } from './app.po';

describe('lunn-net App', () => {
  let page: LunnNetPage;

  beforeEach(() => {
    page = new LunnNetPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
