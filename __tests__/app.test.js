const app = require('../src/app');
const mock = jest.fn();

describe("GET -- view grocery list", () => {
    test('Grocery list starts as an empty array', () => {
        const result = app.getGroceryList();
        
        expect(result).toHaveLength(0);
    })   
});

describe("POST -- add new item to grocery list", () => {
    test('Successfully adding an item to the grocery list should return true', () => {
        const item = {name: "Test1", price: 1.00, quantity: 1, purchased: false};
        const itemStatus = {onList: false, message: `${item.name} is not on the grocery list`};
        const itemAdded = app.addItem(item, itemStatus);
    
        expect(itemAdded).toBeTruthy();
    })

    test('GET -- Grocery list contains added item', () => {
        const groceryList = [{name: "Test1", price: 1.00, quantity: 1, purchased: false}];
        const result = app.getGroceryList();
    
        expect(result).toEqual(groceryList);   
    })

    test('Adding an item without a name should return false', () => {
        const item = {price: 1.50, quantity: 4, purchased: false};
        const itemStatus = {onList: false, message: "Item does not have a valid name"};
        const itemAdded = app.addItem(item, itemStatus);

        expect(itemAdded).toBeFalsy();
    })

    test('Adding an item already on the grocery list should return false', () => {
        const item = {name: "Test1", price: 1.00, quantity: 1, purchased: false};
        const itemStatus = {onList: true, message: `${item.name} is already on the grocery list`};
        const itemAdded = app.addItem(item, itemStatus);

        expect(itemAdded).toBeFalsy();
    })
});

describe("setItemStatus", () => {
    test('Setting the status of an item without a name should set itemStatus.message to "Item does not have a valid name"', () => {
        const item = {price: 1.00, quantity: 1, purchased: false};
        const itemStatus = app.setItemStatus(item);
    
        expect(itemStatus.message).toBe("Item does not have a valid name");
    })
    
    test("Setting the status of an item already on the grocery list should set onList to true and itemStatus.message to '${item.name} is already on the grocery list'", () => {
        const item = {name: "Test1", price: 1.00, quantity: 1, purchased: false};
        const itemStatus = app.setItemStatus(item);

        expect(itemStatus.onList).toBeTruthy();
        expect(itemStatus.message).toBe(`${item.name} is already on the grocery list`)
    })

    test("Setting the status of an item not on the grocery list should set onList to false and itemStatus.message to '${item.name} is not on the grocery list'", () => {
        const item = {name: "Test2", price: 2.00, quantity: 2, purchased: false};
        const itemStatus = app.setItemStatus(item);

        expect(itemStatus.onList).toBeFalsy();
        expect(itemStatus.message).toBe(`${item.name} is not on the grocery list`)
    })

})

describe("PUT -- update item on grocery list", () => {
    test('Successfully updating an item to the grocery list should return true', () => {
        const item = {name: "Test1", price: 2.00, quantity: 2, purchased: true};
        const itemStatus = {onList: true};
        const itemUpdated = app.updateItem(item, itemStatus);
    
        expect(itemUpdated).toBeTruthy();
    })

    test('GET -- Grocery list contains updated item', () => {
        const groceryList = [{name: "Test1", price: 2.00, quantity: 2, purchased: true}];
        const result = app.getGroceryList();
    
        expect(result).toEqual(groceryList);   
    })

    test('Updating an item without a name should return false', () => {
        const item = {price: 1.50, quantity: 4, purchased: false};
        const itemStatus = {onList: false, message: "Item does not have a valid name"};
        const itemUpdated = app.updateItem(item, itemStatus);

        expect(itemUpdated).toBeFalsy();
    })

    test('Updating an item not on the grocery list should return false', () => {
        const item = {name: "Test2", price: 2.00, quantity: 2, purchased: false};
        const itemStatus = {onList: false, message: `${item.name} is not on the grocery list`};
        const itemUpdated = app.updateItem(item, itemStatus);

        expect(itemUpdated).toBeFalsy();
    })
});

describe("DELETE -- delete item from grocery list", () => {
    test('Successfully deleting an item from the grocery list should return true', () => {
        const item = {name: "Test1"};
        const itemStatus = {onList: true};
        const itemDeleted = app.deleteItem(item, itemStatus);
    
        expect(itemDeleted).toBeTruthy();
    })

    test('GET -- Grocery list does not contain deleted item', () => {
        const result = app.getGroceryList();
    
        expect(result).not.toHaveProperty('name', "Test1");
    })

    test('Deleting an item without a name should return false', () => {
        const item = {price: 1.50, quantity: 4, purchased: false};
        const itemStatus = {onList: false, message: "Item does not have a valid name"};
        const itemDeleted = app.deleteItem(item, itemStatus);

        expect(itemDeleted).toBeFalsy();
    })

    test('Deleting an item not on the grocery list should return false', () => {
        const item = {name: "Test2", price: 2.00, quantity: 2, purchased: false};
        const itemStatus = {onList: false, message: `${item.name} is not on the grocery list`};
        const itemDeleted = app.deleteItem(item, itemStatus);

        expect(itemDeleted).toBeFalsy();
    })
});

