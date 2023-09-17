const http = require("http");
const url = require('node:url');
const PORT = 3000;
const { createLogger, transports, format} = require('winston');
module.exports = {getGroceryList, setItemStatus, addItem, deleteItem, updateItem};

//Create Logger
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log'}),
    ]
});


//Initialize grocery list array
const groceryList = [];

//GET grocery list
function getGroceryList(){
    return groceryList;
}

//Set the status of an item
function setItemStatus(item){
    const itemStatus = {};
    itemStatus.onList = false;
    itemStatus.message = "";
    
    //Check if the item has a valid name
    if(!item.name){
        itemStatus.message = "Item does not have a valid name";
    } else {
    //Check if the item is already on the list
        for(grocery of groceryList){
            if(grocery.name === item.name){
                itemStatus.onList = true;
            }
        }
        if(itemStatus.onList){
            itemStatus.message = `${item.name} is already on the grocery list`;
        }else{
            itemStatus.message = `${item.name} is not on the grocery list`;
        }
    }
    return itemStatus;
}

//Add item to grocery list
function addItem(item, itemStatus) {
    if(item.name && !itemStatus.onList){
        groceryList.push(item);
        return true;
    }else{
        return false;
    }
}

//Update an existing item on the grocery list
function updateItem(itemUpdate, itemStatus){   
    if(itemStatus.onList){
        for (item of groceryList){
            if(item.name === itemUpdate.name){
                if("price" in itemUpdate){
                    item.price = itemUpdate.price;
                }
                if("quantity" in itemUpdate){
                    item.quantity = itemUpdate.quantity;
                }
                if("purchased" in itemUpdate){
                    item.purchased = itemUpdate.purchased;
                }    
                return true;   
            }
        }
    }else{
        return false;
    }
}    
    
//Remove an item from the grocery list
function deleteItem(item, itemStatus){
    if(itemStatus.onList){
        for(key in groceryList){
            if(groceryList[key].name === item.name){
                const removedItem = groceryList.splice(key, 1);
                logger.info(`${removedItem[0].name} has been removed from the grocery list`);
                return true;
            }
        }
    }else{
        return false;
    }
}

//Create Server
const server = http.createServer((req, res) => {
        
    //GET grocery list
    if (req.method === 'GET' && req.url === '/grocerylist'){
        res.writeHead(200, { 'Content-Type': 'application/json'});
        logger.info(`User requested to see the grocery list`);
        res.end(JSON.stringify(getGroceryList()));
    
    //POST item to grocery list
    }else if(req.method === 'POST' && req.url === '/grocerylist/add'){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const item = JSON.parse(body);
            const itemStatus = setItemStatus(item);
            
            if(addItem(item, itemStatus)){
                logger.info(`User added ${JSON.stringify(item)} to the grocery list`);
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${(item.name)} Added Successfully!`}));
            }else{
                logger.error(`Invalid item attempted to be added to list. ${itemStatus.message}`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemStatus.message}`}));
            }
        });  

    //PUT update an item on the grocery list
    }else if(req.method === "PUT" && req.url === `/grocerylist/update`){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const item = JSON.parse(body);
            const itemStatus = setItemStatus(item);

            if(updateItem(item, itemStatus)){
                logger.info(`User updated ${JSON.stringify(item)} on the grocery list`);
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${(item.name)} Updated Successfully!`}));
            }else{
                logger.error(`Invalid item attempted to be updated on list. ${itemStatus.message}`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemStatus.message}`}));
            } 
        });

    //DELETE an item from the grocery list
    }else if(req.method === "DELETE" && req.url === `/grocerylist/delete`){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const item = JSON.parse(body);
            const itemStatus = setItemStatus(item);

            if(deleteItem(item, itemStatus)){
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${item.name} Deleted Successfully!`}));
            }else{
                logger.error(`Invalid item attempted to be deleted from list. ${itemStatus.message}`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemStatus.message}`}));
            }
        });

    }else{
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
})


server.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
})

