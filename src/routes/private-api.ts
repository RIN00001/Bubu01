import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
import { BookController } from "../controllers/book-controller";
import { WalletController } from "../controllers/wallet-controller";

import { ItemController } from '../controllers/item-controller';
export const privateRouter = express.Router()

privateRouter.use(authMiddleware)

//Book Router

privateRouter.post("/books", BookController.create);
privateRouter.get("/books", BookController.getAll);
privateRouter.get("/books/:id", BookController.getById);
privateRouter.put("/books/:id", BookController.update);
privateRouter.delete("/books/:id", BookController.delete);

//Wallet Router

privateRouter.post("/wallets", WalletController.create);
privateRouter.get("/wallets", WalletController.getAll);
privateRouter.get("/wallets/:id", WalletController.getById);
privateRouter.put("/wallets/:id", WalletController.update);
privateRouter.delete("/wallets/:id", WalletController.delete);
privateRouter.patch("/wallets/:id/default", WalletController.setDefault);

//untuk item
privateRouter.post("/items", ItemController.create);
privateRouter.get("/items", ItemController.list);
privateRouter.get("/items/:itemId", ItemController.get);
privateRouter.put("/items/:itemId", ItemController.update);
privateRouter.delete("/items/:itemId", ItemController.remove);
