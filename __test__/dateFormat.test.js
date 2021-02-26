import { getDate } from '../src/client/js/date';

describe("Test date function", () => {

    test("It should return specific date format", () => {
        expect(getDate()).toMatch(/20[2-5][1-5]-[0-1][1-9]-[0-3][0-9]/);
    });
});