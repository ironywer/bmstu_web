export default class AppModel {
    static async getOrders() {
        try {
            const response = await fetch('/orders');
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return response.json();
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getProducts() {
        try {
            const response = await fetch('/products');
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return response.json();
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addOrder({ orderID, customerName, orderDate }) {
        try {
            const response = await fetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID, customerName, orderDate })
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return {
                timestamp: new Date().toISOString(),
                message: `Order for '${customerName}' was successfully created`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateOrder({ orderID, customerName, orderDate }) {
        try {
            const response = await fetch(`/orders/${orderID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, orderDate })
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return {
                timestamp: new Date().toISOString(),
                message: `Order successfully updated`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteOrder({ orderID }) {
        try {
            const response = await fetch(`/orders/${orderID}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return {
                timestamp: new Date().toISOString(),
                message: `Order successfully deleted`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addPosition({ positionID, quantity, orderID, productID }) {
        try {
            const response = await fetch('/positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ positionID, quantity, orderID, productID })
            });
            if (!response.ok) {
                const errorData = await response.json();
                const message = errorData.message || 'Неизвестная ошибка при добавлении позиции.';
                return Promise.reject({ message });
            }            
            return {
                timestamp: new Date().toISOString(),
                message: `Position successfully added to order`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updatePosition({ positionID, quantity }) {
        try {
            const response = await fetch(`/positions/${positionID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return {
                timestamp: new Date().toISOString(),
                message: `Position quantity successfully updated`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deletePosition({ positionID }) {
        try {
            const response = await fetch(`/positions/${positionID}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            const data = await response.json();
            return {
                timestamp: new Date().toISOString(),
                message: data.message
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async movePosition({ positionID, srcOrderID, destOrderID }) {
        try {
            const response = await fetch('/positions/move', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ positionID, srcOrderID, destOrderID })
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return {
                timestamp: new Date().toISOString(),
                message: `Position successfully moved to another order`
            };
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async processDailyUpdate({ dateStr }) {
        try {
            const response = await fetch(`/warehouse/daily-update?date=${dateStr}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorData = await response.json();
                return Promise.reject(errorData);
            }
            return await response.json();
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
}