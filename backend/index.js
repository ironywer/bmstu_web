import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DB from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const appHost = process.env.APP_HOST || '127.0.0.1';
const appPort = Number(process.env.APP_PORT || 5000);

const app = express();
const db = new DB();

app.use('*', (req, res, next) => {
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString());
    next();
});

app.use('/', express.static(path.resolve(__dirname, '../frontend/dist')));
app.use(express.json());

// [GET] /orders
app.get('/orders', async (req, res) => {
    try {
        const [dbOrders, dbPositions] = await Promise.all([
            db.getOrders(),
            db.getPositions()
        ]);

        const positions = dbPositions.map(({ id, name, quantity, order_id, product_id }) => ({
            positionID: id,
            productName: name,
            quantity,
            orderID: order_id,
            productID: product_id
        }));

        const orders = dbOrders.map(order => ({
            orderID: order.id,
            customerName: order.customer_name,
            orderDate: order.order_date,
            positions: positions.filter(pos => order.positions.includes(pos.positionID))
        }));

        const products = await db.getProducts();
        res.status(200).json({ orders, products });
    } catch (err) {
        const errorText = err.message || JSON.stringify(err);
        res.status(500).json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Ошибка при получении заказов: ${errorText}`
        });
    }
});

// [GET] /products
app.get('/products', async (req, res) => {
    try {
        const products = await db.getProducts();
        res.status(200).json(products);
    } catch (err) {
        const errorText = err.message || JSON.stringify(err);
        res.status(500).json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Ошибка при получении продуктов: ${errorText}`
        });
    }
});

// [POST] /orders
app.post('/orders', async (req, res) => {
    try {
        const { orderID, customerName, orderDate } = req.body;
        await db.addOrder({ orderID, customerName, orderDate });
        res.status(200).send();
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при создании нового заказа: ${errorText}`
        });
    }
});

// [PATCH] /orders/:orderID
app.patch('/orders/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;
        const { customerName, orderDate } = req.body;
        await db.updateOrder({ orderID, customerName, orderDate });
        res.status(200).send();
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при обновлении заказа: ${errorText}`
        });
    }
});

// [POST] /positions
app.post('/positions', async (req, res) => {
    try {
        const { positionID, quantity, orderID, productID } = req.body;
        await db.addPosition({ positionID, quantity, orderID, productID });
        res.status(200).send();
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при добавлении позиции: ${errorText}`
        });
    }
});

// [DELETE] /orders/:orderID
app.delete('/orders/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;
        await db.deleteOrder({ orderID });
        res.status(200).send();
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при удалении заказа: ${errorText}`
        });
    }
});

// [DELETE] /positions/:positionID
app.delete('/positions/:positionID', async (req, res) => {
    try {
        const { positionID } = req.params;
        await db.deletePosition({ positionID });
        res.status(200).json({ message: 'Position successfully deleted' });
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при удалении позиции: ${errorText}`
        });
    }
});

// [PATCH] /positions/move
app.patch('/positions/move', async (req, res) => {
    try {
        const { positionID, srcOrderID, destOrderID } = req.body;
        await db.movePosition({ positionID, srcOrderID, destOrderID });
        res.status(200).send();
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при перемещении позиции: ${errorText}`
        });
    }
});

// [PATCH] /positions/:positionID
app.patch('/positions/:positionID', async (req, res) => {
    try {
        const { positionID } = req.params;
        const { quantity } = req.body;

        await db.updatePosition({ positionID, quantity });
        
        res.status(200).json({
            timestamp: new Date().toISOString(),
            statusCode: 200,
            message: 'Position quantity successfully updated'
        });
    } catch (err) {
        const status = err.type === 'client' ? 400 : 500;
        const errorText = err.message || JSON.stringify(err);
        res.status(status).json({
            timestamp: new Date().toISOString(),
            statusCode: status,
            message: `Ошибка при обновлении позиции: ${errorText}`
        });
    }
});

// [POST] /warehouse/daily-update?date=YYYY-MM-DD
app.post('/warehouse/daily-update', async (req, res) => {
    try {
        const dateParam = req.query.date;
        if (!dateParam) {
            return res.status(400).json({
                message: 'Missing ?date=YYYY-MM-DD parameter'
            });
        }

        const virtualDate = new Date(dateParam);
        if (isNaN(virtualDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const deletedCount = await db.deleteExpiredOrdersByDate(virtualDate);

        await db.replenishStock();

        const [dbOrders, dbPositions] = await Promise.all([
            db.getOrders(),
            db.getPositions()
        ]);
        const positions = dbPositions.map(({ id, name, quantity, order_id, product_id }) => ({
            positionID: id,
            productName: name,
            quantity,
            orderID: order_id,
            productID: product_id
        }));
        const orders = dbOrders.map(order => ({
            orderID: order.id,
            customerName: order.customer_name,
            orderDate: order.order_date,
            positions: positions.filter(pos => order.positions.includes(pos.positionID))
        }));
        const products = await db.getProducts();

        res.status(200).json({
            message: `Processed ${deletedCount} expired orders and replenished stock`,
            orders,
            products
        });
    } catch (err) {
        const errorText = err.message || JSON.stringify(err);
        res.status(500).json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Error processing daily update: ${errorText}`
        });
    }
});

const server = app.listen(appPort, appHost, async () => {
    try {
        await db.connect();
        console.log(`Warehouse app at http://${appHost}:${appPort}`);

        const now = new Date();
        const deletedCount = await db.deleteExpiredOrdersByDate(now);
        if (deletedCount > 0) {
            console.log(`Removed ${deletedCount} expired orders on startup`);
        }
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});