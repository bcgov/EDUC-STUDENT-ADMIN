import { Selector } from 'testcafe';

fixture `Basic Test`.page `https://student-admin-c2mvws-dev.pathfinder.gov.bc.ca`;

test(`Test page load`, async t => {
    await t.expect(Selector('#app').count).eql(1);
});