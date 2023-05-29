interface ITreeItem {
    id: string | number,
    parent: string | number,
    type?: string | null,
    children?: ITreeItem[]
}

export default class TreeStore {
    originalArray: ITreeItem[]
    treeItems: ITreeItem[]

    constructor(treeItems:ITreeItem[]) {
        this.originalArray = treeItems
        this.treeItems = this.buildTree(treeItems.slice())
    }

    private buildTree(array: ITreeItem[]) {
        const map = new Map(array.map(item => [item.id, Object.assign({}, item)]));

        for (let item of map.values()) {
            if (!map.has(item.parent) && item.parent !== 'root') {
                continue;
            }
            const parent = map.get(item.parent);
            if (parent) {
                parent.children = [...parent.children || [], item];
            }
        }

        return [...map.values()].filter(item => item.parent === 'root');
    }

    private searchById(array: ITreeItem[], id: number): ITreeItem | null {
        let result = null
        array.forEach(elem => {
            if (+elem.id === id) {
                result = elem
                return
            }

            if (!elem?.children || !elem.children.length) {
                return
            }

            result = this.searchById(elem.children, id)
        })
        return result
    }

    private static _omit<T>(key: string, obj: T) {
        const { [key as keyof typeof obj]: omitted, ...rest } = obj;
        return rest;
    }

    private searchChildren(array: ITreeItem[]): ITreeItem[] | [] {
        const result: ITreeItem[] = []

        array.forEach(elem => {
            result.push(TreeStore._omit<ITreeItem>('children', elem) as ITreeItem) // чтобы убрать в выводе children, т.к. в дереве они есть

            if (!elem?.children) {
                return
            }

            result.push(...this.searchChildren(elem.children))
        })

        return result
    }

    private searchParent(item: ITreeItem, byArray?:boolean): ITreeItem[] | [] {
        const result: ITreeItem[] = []

        if (byArray) {
            const finded = this.originalArray.find(elem => +elem.id === +item.parent)
            if (finded) {
                result.push(finded)

                result.push(...this.searchParent(finded, byArray))
            }
        }

        if (item.parent) {
            result.push(TreeStore._omit<ITreeItem>('children', item) as ITreeItem)
            const finded = this.searchById(this.treeItems, +item.parent)
            if (finded) {
                result.push(...this.searchParent(TreeStore._omit<ITreeItem>('children', finded) as ITreeItem))
            }
        }

        return result
    }

    getAll(): ITreeItem[] {
        return this.originalArray
    }

    getItem(id: number, byArray?: boolean): ITreeItem | null {
        if (byArray) { // Поиск через массив
            const result = this.originalArray.find(elem => +elem.id === id)
            return result ? result : null
        }

        const result = this.searchById(this.treeItems, id) // поиск по дереву с рекурсией
        return result ? result : null
    }

    getChildren(id: number, byArray?: boolean): ITreeItem[] | [] {
        if (byArray) { // Поиск через массив
            return this.originalArray.filter(elem => +elem.parent === id)
        }

        const result = this.searchById(this.treeItems, id) // поиск по дереву с рекурсией
        if (result && result?.children) {
            return result.children.map(({children, ...keepAttrs}) => keepAttrs)
        }

        return []
    }

    getAllChildren(id: number, byArray?: boolean): ITreeItem[] | [] {
        if (byArray) { // Поиск через массив
            const result = this.originalArray.filter(elem => +elem.parent === id)
            result.forEach(parent => {
                result.push(...this.originalArray.filter(elem => +elem.parent === +parent.id))
            })

            return result
        }

        const result = this.searchById(this.treeItems, id) // поиск по дереву с рекурсией
        if (result && result?.children) {
            return this.searchChildren(result.children).sort((a, b) => {
                if (+a.id > +b.id) {
                    return 1
                } else {
                    return -1
                }
            })
        }

        return []
    }

    getAllParents(id: number, byArray?: boolean): ITreeItem[] | [] {
        if (byArray) {
            const startItem = this.originalArray.find(elem => +elem.id === id)
            return startItem ? this.searchParent(startItem, byArray) : []
        }

        const result = this.searchById(this.treeItems, id) // поиск по дереву с рекурсией
        return result ? this.searchParent(result).filter(elem => +elem.id !== id) : []
    }
}


const items = [
    { id: 1, parent: 'root' },
    { id: 2, parent: 1, type: 'test' },
    { id: 3, parent: 1, type: 'test' },

    { id: 4, parent: 2, type: 'test' },
    { id: 5, parent: 2, type: 'test' },
    { id: 6, parent: 2, type: 'test' },

    { id: 7, parent: 4, type: null },
    { id: 8, parent: 4, type: null },
];
const ts = new TreeStore(items);

console.log(ts.getAll()) // [{"id":1,"parent":"root"},{"id":2,"parent":1,"type":"test"},{"id":3,"parent":1,"type":"test"},{"id":4,"parent":2,"type":"test"},{"id":5,"parent":2,"type":"test"},{"id":6,"parent":2,"type":"test"},{"id":7,"parent":4,"type":null},{"id":8,"parent":4,"type":null}]
console.log(ts.getItem(7)) // {"id":7,"parent":4,"type":null}
console.log(ts.getChildren(4)) // [{"id":7,"parent":4,"type":null},{"id":8,"parent":4,"type":null}]
console.log(ts.getChildren(5)) // []
console.log(ts.getChildren(2)) // [{"id":4,"parent":2,"type":"test"},{"id":5,"parent":2,"type":"test"},{"id":6,"parent":2,"type":"test"}]
console.log(ts.getAllChildren(2)) // [{"id":4,"parent":2,"type":"test"},{"id":5,"parent":2,"type":"test"},{"id":6,"parent":2,"type":"test"},{"id":7,"parent":4,"type":null},{"id":8,"parent":4,"type":null}]
console.log(ts.getAllParents(7)) // [{"id":4,"parent":2,"type":"test"},{"id":2,"parent":1,"type":"test"},{"id":1,"parent":"root"}]

