import pg from 'pg';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;
    }

    async connect() {
        let retries = 5;
        while (retries) {
            try {
                // Создаем новый клиент при каждой попытке
                this.#dbClient = new pg.Client({
                    user: this.#dbLogin,
                    password: this.#dbPassword,
                    host: this.#dbHost,
                    port: this.#dbPort,
                    database: this.#dbName
                });

                await this.#dbClient.connect();
                console.log('DB connection established');
                return;
            } catch (error) {
                if (this.#dbClient) {
                    try {
                        await this.#dbClient.end();
                    } catch (endError) {
                        console.error('Error while closing client:', endError);
                    }
                }

                console.error('Unable to connect to DB:', error);
                retries -= 1;
                if (retries === 0) {
                    return Promise.reject(error);
                }
                console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
                await sleep(5000);
            }
        }
    }

    async disconnect() {
        try {
            await this.#dbClient.end();
            console.log('DB connection closed');
        } catch (error) {
            console.error('Unable to disconnect from DB:', error);
            return Promise.reject(error);
        }
    }

    async getOrders() {
        try {
            const orders = await this.#dbClient.query(
                'SELECT * FROM orders ORDER BY order_date;'
            );
            return orders.rows;
        } catch (error) {
            console.error('Unable to get orders:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getPositions() {
        try {
            const positions = await this.#dbClient.query(`
                SELECT positions.id, products.name, positions.quantity, order_id, product_id
                FROM positions
                LEFT JOIN products ON positions.product_id = products.id;
            `);
            return positions.rows;
        } catch (error) {
            console.error('Unable to get positions:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getProducts() {
        try {
            const products = await this.#dbClient.query(
                'SELECT * FROM products ORDER BY name;'
            );
            return products.rows;
        } catch (error) {
            console.error('Unable to get products:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addOrder({ orderID, customerName, orderDate }) {
        if (!orderID || !customerName || !orderDate) {
            const errMsg = `Add order error: invalid parameters (id: ${orderID}, name: ${customerName}, date: ${orderDate})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        const dateObj = new Date(orderDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        dateObj.setHours(0, 0, 0, 0);

        if (dateObj < now) {
            const errMsg = 'Order date cannot be earlier than current date';
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'INSERT INTO orders (id, customer_name, order_date) VALUES ($1, $2, $3)',
                [orderID, customerName, dateObj]
            );
        } catch (error) {
            console.error('Unable to add order:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async updateOrder({ orderID, customerName, orderDate }) {
        if (!orderID || !customerName || !orderDate) {
            const errMsg = `Update order error: invalid parameters (orderID: ${orderID}, name: ${customerName}, date: ${orderDate})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        const dateObj = new Date(orderDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        dateObj.setHours(0, 0, 0, 0);
        if (dateObj < now) {
            const errMsg = 'Order date cannot be earlier than current date';
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'UPDATE orders SET customer_name=$1, order_date=$2 WHERE id=$3',
                [customerName, dateObj, orderID]
            );
        } catch (error) {
            console.error('Unable to update order:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addPosition({ positionID, quantity, orderID, productID }) {
        if (!positionID || quantity <= 0 || !orderID || !productID) {
            const errMsg = `Add position error: invalid parameters (${positionID}, ${quantity}, ${orderID}, ${productID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            const productQuery = await this.#dbClient.query(
                'SELECT stock_quantity FROM products WHERE id = $1',
                [productID]
            );
            if (productQuery.rows.length === 0) {
                throw new Error('Товар не найден в таблице products');
            }
            if (productQuery.rows[0].stock_quantity < quantity) {
                throw new Error(
                    `Недостаточно товара на складе. Доступно: ${productQuery.rows[0].stock_quantity}`
                );
            }

            await this.#dbClient.query('BEGIN');

            await this.#dbClient.query(
                'INSERT INTO positions (id, quantity, order_id, product_id) VALUES ($1, $2, $3, $4)',
                [positionID, quantity, orderID, productID]
            );
            await this.#dbClient.query(
                'UPDATE orders SET positions = array_append(positions, $1) WHERE id = $2',
                [positionID, orderID]
            );
            await this.#dbClient.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [quantity, productID]
            );

            await this.#dbClient.query('COMMIT');
        }
        catch (error) {
            let errorMessage = 'Произошла ошибка при добавлении позиции.';

            if (error.message.includes('Недостаточно товара на складе')) {
                errorMessage = 'Недостаточно товара на складе! Выберите меньшее количество.';
            }

            console.error('Ошибка при добавлении позиции:', errorMessage);
            return Promise.reject({
                type: 'internal',
                message: errorMessage
            });
        }

    }

    async updatePosition({ positionID, quantity }) {
        if (!positionID || quantity <= 0) {
            const errMsg = `Update position error: invalid parameters (positionID: ${positionID}, quantity: ${quantity})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query('BEGIN');

            // Получаем текущие данные позиции
            const currentPosition = await this.#dbClient.query(
                'SELECT product_id, quantity FROM positions WHERE id = $1',
                [positionID]
            );

            if (currentPosition.rows.length === 0) {
                throw new Error(`Position ${positionID} not found`);
            }

            const oldQuantity = currentPosition.rows[0].quantity;
            const productID = currentPosition.rows[0].product_id;

            // Если нужно больше товара, проверяем остаток
            if (quantity > oldQuantity) {
                const productQuery = await this.#dbClient.query(
                    'SELECT stock_quantity FROM products WHERE id = $1',
                    [productID]
                );

                const additionalNeeded = quantity - oldQuantity;
                if (productQuery.rows[0].stock_quantity < additionalNeeded) {
                    throw new Error(`Недостаточно товара на складе. Доступно: ${productQuery.rows[0].stock_quantity}`);
                }
            }

            // Обновляем количество в позиции
            await this.#dbClient.query(
                'UPDATE positions SET quantity = $1 WHERE id = $2',
                [quantity, positionID]
            );

            // Обновляем остаток на складе
            const quantityDiff = quantity - oldQuantity;
            await this.#dbClient.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [quantityDiff, productID]
            );

            await this.#dbClient.query('COMMIT');
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to update position:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deleteOrder({ orderID }) {
        if (!orderID) {
            const errMsg = `Delete order error: invalid ID (${orderID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query('BEGIN');

            // Возвращаем товары на склад
            const positions = await this.#dbClient.query(
                'SELECT product_id, quantity FROM positions WHERE order_id = $1',
                [orderID]
            );
            for (const pos of positions.rows) {
                await this.#dbClient.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [pos.quantity, pos.product_id]
                );
            }

            // Удаляем позиции
            await this.#dbClient.query(
                'DELETE FROM positions WHERE order_id = $1',
                [orderID]
            );
            // Удаляем заказ
            await this.#dbClient.query(
                'DELETE FROM orders WHERE id = $1',
                [orderID]
            );

            await this.#dbClient.query('COMMIT');
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to delete order:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deletePosition({ positionID }) {
        if (!positionID) {
            const errMsg = `Delete position error: invalid ID (${positionID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query('BEGIN');

            // Найдём, сколько товара было
            const position = await this.#dbClient.query(
                'SELECT product_id, quantity FROM positions WHERE id = $1',
                [positionID]
            );
            if (position.rows.length === 0) {
                const errMsg = `Position with id ${positionID} not found`;
                console.error(errMsg);
                await this.#dbClient.query('ROLLBACK');
                return Promise.reject({
                    type: 'client',
                    error: new Error(errMsg)
                });
            }

            // Вернуть на склад
            await this.#dbClient.query(
                'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                [position.rows[0].quantity, position.rows[0].product_id]
            );

            // Убрать из заказа
            await this.#dbClient.query(
                'UPDATE orders SET positions = array_remove(positions, $1) WHERE $1 = ANY(positions)',
                [positionID]
            );

            // Удалить из таблицы positions
            await this.#dbClient.query(
                'DELETE FROM positions WHERE id = $1',
                [positionID]
            );

            await this.#dbClient.query('COMMIT');
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to delete position:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    // Удаляем заказы, у которых order_date < virtualDate
    // (виртуальная дата передаётся клиентом)
    async deleteExpiredOrdersByDate(virtualDate) {
        try {
            await this.#dbClient.query('BEGIN');

            // Удаляем где order_date < virtualDate
            const expiredOrders = await this.#dbClient.query(
                `SELECT id FROM orders WHERE order_date < $1`,
                [virtualDate]
            );

            for (const order of expiredOrders.rows) {
                // Вернуть товары на склад
                const positions = await this.#dbClient.query(
                    'SELECT product_id, quantity FROM positions WHERE order_id = $1',
                    [order.id]
                );
                for (const pos of positions.rows) {
                    await this.#dbClient.query(
                        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                        [pos.quantity, pos.product_id]
                    );
                }
                // Удалить позиции
                await this.#dbClient.query(
                    'DELETE FROM positions WHERE order_id = $1',
                    [order.id]
                );
                // Удалить заказ
                await this.#dbClient.query(
                    'DELETE FROM orders WHERE id = $1',
                    [order.id]
                );
            }

            await this.#dbClient.query('COMMIT');
            return expiredOrders.rows.length;
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to delete expired orders by date:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async replenishStock() {
        try {
            const products = await this.#dbClient.query('SELECT id FROM products');
            await this.#dbClient.query('BEGIN');
            for (const p of products.rows) {
                const increment = Math.floor(Math.random() * (50 - 10) + 10);
                await this.#dbClient.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [increment, p.id]
                );
            }
            await this.#dbClient.query('COMMIT');
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to replenish stock:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    // Перенос позиции в другой заказ, с объединением, если там уже есть этот же product_id
    async movePosition({ positionID, srcOrderID, destOrderID }) {
        if (!positionID || !srcOrderID || !destOrderID) {
            const errMsg = `Move position error: invalid parameters (positionID: ${positionID}, srcOrderID: ${srcOrderID}, destOrderID: ${destOrderID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            // Найдём товар (product_id) и кол-во в исходной позиции
            const { rows } = await this.#dbClient.query(`
                SELECT product_id, quantity FROM positions
                WHERE id = $1 AND order_id = $2
            `, [positionID, srcOrderID]);
            if (!rows.length) {
                throw new Error('Position not found in srcOrder');
            }
            const { product_id, quantity } = rows[0];

            await this.#dbClient.query('BEGIN');

            // Проверим, нет ли в целевом заказе уже позиции с тем же товаром
            const checkDest = await this.#dbClient.query(`
                SELECT id, quantity FROM positions
                WHERE order_id = $1 AND product_id = $2
            `, [destOrderID, product_id]);

            if (checkDest.rows.length) {
                // Уже есть такая позиция => объединяем
                const destPosID = checkDest.rows[0].id;
                const oldQty = checkDest.rows[0].quantity;
                const newQty = oldQty + quantity;

                // Увеличиваем кол-во
                await this.#dbClient.query(`
                    UPDATE positions
                    SET quantity = $1
                    WHERE id = $2
                `, [newQty, destPosID]);

                // Удаляем старую позицию из таблицы
                await this.#dbClient.query(`
                    DELETE FROM positions
                    WHERE id = $1
                `, [positionID]);

                // Удаляем ссылку на старую позицию из srcOrder
                await this.#dbClient.query(`
                    UPDATE orders
                    SET positions = array_remove(positions, $1)
                    WHERE id = $2
                `, [positionID, srcOrderID]);

                // У destOrder позиция destPosID уже может быть в массиве,
                // если она была добавлена через addPosition. Но на всякий случай можно:
                // UPDATE orders SET positions = array_append(positions, $1)
                // WHERE id = $2
                // [destPosID, destOrderID];

            } else {
                // Нет дубликатов — просто поменяем order_id
                await this.#dbClient.query(`
                    UPDATE positions
                    SET order_id = $1
                    WHERE id = $2
                `, [destOrderID, positionID]);

                // Убираем позицию из srcOrder
                await this.#dbClient.query(`
                    UPDATE orders
                    SET positions = array_remove(positions, $1)
                    WHERE id = $2
                `, [positionID, srcOrderID]);

                // Добавляем позицию в destOrder
                await this.#dbClient.query(`
                    UPDATE orders
                    SET positions = array_append(positions, $1)
                    WHERE id = $2
                `, [positionID, destOrderID]);
            }

            await this.#dbClient.query('COMMIT');
        } catch (error) {
            await this.#dbClient.query('ROLLBACK');
            console.error('Unable to move position:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
}