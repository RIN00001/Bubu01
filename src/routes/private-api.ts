import { Router } from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
import { BookController } from '../controllers/book-controller';
import { WalletController } from '../controllers/wallet-controller';
import { ItemController } from '../controllers/item-controller';
import { SavingController } from '../controllers/saving-controller';
import { CategoryController } from '../controllers/category-controller';

export const privateRouter = Router();

privateRouter.use(authMiddleware);

// Book Routes
privateRouter.post("/books", BookController.create);
privateRouter.get("/books", BookController.getAll);
privateRouter.get("/books/:id", BookController.getById);
privateRouter.put("/books/:id", BookController.update);
privateRouter.delete("/books/:id", BookController.delete);

// Wallet Routes
privateRouter.post("/wallets", WalletController.create);
privateRouter.get("/wallets", WalletController.getAll);
privateRouter.get("/wallets/:id", WalletController.getById);
privateRouter.put("/wallets/:id", WalletController.update);
privateRouter.delete("/wallets/:id", WalletController.delete);
privateRouter.patch("/wallets/:id/default", WalletController.setDefault);

// Item routes
privateRouter.post("/items", ItemController.create);
privateRouter.get("/items", ItemController.list);
privateRouter.get("/items/:itemId", ItemController.get);
privateRouter.put("/items/:itemId", ItemController.update);
privateRouter.delete("/items/:itemId", ItemController.remove);

//Saving Routes
privateRouter.get("/savings", SavingController.getAllSavings);
privateRouter.post("/saving", SavingController.createSaving);
privateRouter.get("/saving/:id", SavingController.getSavingById);
privateRouter.put("/saving/:id", SavingController.updateSaving);
privateRouter.delete("/saving/:id", SavingController.deleteSaving);

// Category Routes
privateRouter.post("/categories", CategoryController.create);
privateRouter.get("/categories", CategoryController.list);
privateRouter.get("/categories/:id", CategoryController.get);
privateRouter.put("/categories/:id", CategoryController.update);
privateRouter.delete("/categories/:id", CategoryController.remove);