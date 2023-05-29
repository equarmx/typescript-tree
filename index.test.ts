import {describe, expect, test} from '@jest/globals';
import TreeStore from './index';

const testItems = [
    { id: 1, parent: 'root' },
    { id: 2, parent: 1, type: 'test' },
    { id: 3, parent: 1, type: 'test' },

    { id: 4, parent: 2, type: 'test' },
    { id: 5, parent: 2, type: 'test' },
    { id: 6, parent: 2, type: 'test' },

    { id: 7, parent: 4, type: null },
    { id: 8, parent: 4, type: null },
];
const ts = new TreeStore(testItems);

describe('tree-structure', () => {
    test('get default array: ts.getAll()', () => {
        expect(ts.getAll()).toBe(testItems);
    });
    test('get item by id: ts.getItem(7)', () => {
        expect(ts.getItem(7)).toStrictEqual({"id":7,"parent":4,"type":null});
    });
    test('get children items: ts.getChildren(4)', () => {
        expect(ts.getChildren(4)).toStrictEqual([{"id":7,"parent":4,"type":null},{"id":8,"parent":4,"type":null}]);
    });
    test('get children if item haven"t children: ts.getChildren(5)', () => {
        expect(ts.getChildren(5)).toStrictEqual([]);
    });
    test('get children items: ts.getChildren(2)', () => {
        expect(ts.getChildren(2)).toStrictEqual([{"id":4,"parent":2,"type":"test"},{"id":5,"parent":2,"type":"test"},{"id":6,"parent":2,"type":"test"}]);
    });
    test('get get all children by item: ts.getAllChildren(2)', () => {
        expect(ts.getAllChildren(2)).toStrictEqual([{"id":4,"parent":2,"type":"test"},{"id":5,"parent":2,"type":"test"},{"id":6,"parent":2,"type":"test"},{"id":7,"parent":4,"type":null},{"id":8,"parent":4,"type":null}]);
    });
    test('get get all parents of item: ts.getAllParents(7)', () => {
        expect(ts.getAllParents(7)).toStrictEqual([{"id":4,"parent":2,"type":"test"},{"id":2,"parent":1,"type":"test"},{"id":1,"parent":"root"}]);
    });
});
