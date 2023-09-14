const http = require("http");
const url = require('node:url');
const PORT = 3000;
const { createLogger, transports, format} = require('winston');

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


//Grocery list array
const groceryList = [];

//Create Server
const server = http.createServer((req, res) => {
        
    //GET grocery list
    if (req.method === 'GET' && req.url === '/api/grocerylist'){
        res.writeHead(200, { 'Content-Type': 'application/json'});
        const data = {groceryList};
        logger.info(`User requested to see the grocery list`);
        res.end(JSON.stringify(data));
    
    //POST item to grocery list
    }else if(req.method === 'POST' && req.url === '/api/grocerylist/add'){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const item = JSON.parse(body);
            
            //Check if item is already on grocery list
            let itemAlreadyOnList = false;
            for(grocery of groceryList){
                if(grocery.name === item.name){
                    itemAlreadyOnList = true;
                }
            }
            //Check if the item has a name or already on the grocery list
            //Add item if valid
            if(!item.name){
                logger.error('User tried to add an item without a name');
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Please include a name for the item in JSON format'}));
            }else if(itemAlreadyOnList){ 
                logger.error(`User attemped to add a duplicate item (${item.name})`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${item.name} is already on your grocery list. You can update the item by sending a PUT request to http://localhost:3000/api/grocerylist/update. You can delete the item by sending a DELETE request to http://localhost:3000/api/grocerylist/delete`})); 
            }else{ 
                groceryList.push(item);
                res.writeHead(201, {'Content-Type': 'application/json'});
                logger.info(`User added ${JSON.stringify(item)} to the grocery list`);
                res.end(JSON.stringify({message: `${(item.name)} Added Successfully!`}));
            }
        });  

    //PUT update an item
    }else if(req.method === "PUT" && req.url === `/api/grocerylist/update`){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const itemUpdate = JSON.parse(body);
            
            //Check if the item has a name and already on the grocery list
            //Update item if valid
            let itemAlreadyOnList = false;
            for(grocery of groceryList){
                if(grocery.name === itemUpdate.name){
                    itemAlreadyOnList = true;
                }
            }
            if(!itemUpdate.name){
                logger.error('Item does not have a name');
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Please include a name for the item in JSON format'}));
            }else if(itemAlreadyOnList){
                for (item of groceryList){
                    if(item.name === itemUpdate.name){
                        logger.info(`User updated ${JSON.stringify(item)} with the following changes ${JSON.stringify(itemUpdate)}`);
                        if("price" in itemUpdate){
                            item.price = itemUpdate.price;
                        }else if("quantity" in itemUpdate){
                            item.quantity = itemUpdate.quantity;
                        }else if("purchased" in itemUpdate){
                            item.purchased = itemUpdate.purchased;
                        }else{
                            logger.error(`No changes listed for ${itemUpdate.name}`);
                        }    
                    }
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemUpdate.name} Updated Successfully!`}));     
            }else{
                logger.error(`User attemped to update an item (${itemUpdate.name}) not grocery list`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemUpdate.name} is not on your grocery list. You can add it to your list by sending a POST request to http://localhost:3000/api/grocerylist/add`}));
            }
      
        });
    
    }else if(req.method === "DELETE" && req.url === `/api/grocerylist/delete`){
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const itemToRemove = JSON.parse(body);

            //Check if the item has a name and already on the grocery list
            //Delete item if valid
            let itemAlreadyOnList = false;
            for(grocery of groceryList){
                if(grocery.name === itemToRemove.name){
                    itemAlreadyOnList = true;
                }
            }
            if(!itemToRemove.name){
                logger.error('Item does not have a name');
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Please include a name for the item in JSON format'}));
            }else if(itemAlreadyOnList){
                for(key in groceryList){
                    if(groceryList[key].name === itemToRemove.name){
                        const removedItem = groceryList.splice(key, 1);
                        logger.info(`${removedItem[0].name} has been removed from the grocery list`);
                    }
                }         
                
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemToRemove.name} Deleted Successfully!`}));
            }else{
                logger.error(`User attemped to delete an item (${itemToRemove.name}) not grocery list`);
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: `${itemToRemove.name} is not on your grocery list. You can add it to your list by sending a POST request to http://localhost:3000/api/grocerylist/add`}));
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