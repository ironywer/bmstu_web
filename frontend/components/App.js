import Tasklist from './Tasklist.js';
import AppModel from '../model/AppModel.js';

export default class App {
    #orders = [];
    #products = [];
    #currentDate = new Date();

    onEscapeKeydown = (event) => {
        if (event.key === 'Escape') {
            const addForm = document.querySelector('.order-adder__form');
            const addButton = document.querySelector('.order-adder__btn');
            if (addForm) addForm.style.display = 'none';
            if (addButton) addButton.style.display = 'inherit';
        }
    };

    async reloadOrdersAndProducts() {
        try {
            const { orders, products } = await AppModel.getOrders();
            this.#products = products;

            this.#orders.forEach(o => {
                const elem = document.getElementById(o.orderID);
                if (elem) elem.remove();
            });
            this.#orders = [];

            for (const order of orders) {
                const orderComp = new Tasklist({
                    orderID: order.orderID,
                    customerName: order.customerName,
                    orderDate: order.orderDate,
                    onDropPosition: this.onDropPosition,
                    addNotification: this.addNotification,
                    availableProducts: products,
                    onDeleteOrder: this.onDeleteOrder,
                    onEditOrder: this.onEditOrder
                });
                this.#orders.push(orderComp);
                orderComp.render();

                for (const pos of order.positions) {
                    orderComp.addNewPosition({
                        positionID: pos.positionID,
                        productName: pos.productName,
                        quantity: pos.quantity,
                        productID: pos.productID
                    });
                }
            }
            this.initModals();
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }
    }

    onCreateOrder = async () => {
        const nameInput = document.getElementById('new-order-name');
        const dateInput = document.getElementById('new-order-date');

        const orderID = crypto.randomUUID();
        const orderDate = new Date(dateInput.value);
        const today = this.#currentDate;
        orderDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        if (orderDate < this.#currentDate) {
            this.addNotification({
                text: 'Ошибка: нельзя создать заказ на прошедшую дату!',
                type: 'error'
            });
            return;
        }
        try {
            await AppModel.addOrder({
                orderID,
                customerName: nameInput.value,
                orderDate: orderDate.getTime()
            });

            const newOrder = new Tasklist({
                orderID,
                customerName: nameInput.value,
                orderDate: dateInput.value,
                onDropPosition: this.onDropPosition,
                addNotification: this.addNotification,
                availableProducts: this.#products,
                onDeleteOrder: this.onDeleteOrder,
                onEditOrder: this.onEditOrder
            });
            this.#orders.push(newOrder);
            newOrder.render();

            this.addNotification({
                text: `Заказ для ${nameInput.value} успешно создан`,
                type: 'success'
            });
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }

        const addForm = document.querySelector('.order-adder__form');
        const inputs = addForm.querySelectorAll('input');
        inputs.forEach(input => (input.value = ''));
        addForm.style.display = 'none';

        const addButton = document.querySelector('.order-adder__btn');
        addButton.style.display = 'inherit';
    };

    deletePosition = async ({ positionID }) => {
        let position = null;
        let order = null;

        for (const o of this.#orders) {
            position = o.getPositionById({ positionID });
            if (position) {
                order = o;
                break;
            }
        }
        if (!position || !order) return;

        try {
            const deleteResult = await AppModel.deletePosition({ positionID });
            await this.reloadOrdersAndProducts();

            this.addNotification({
                text: deleteResult.message,
                type: 'success'
            });
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }
    };

    onDeleteOrder = async ({ orderID }) => {
        try {
            const result = await AppModel.deleteOrder({ orderID });
            await this.reloadOrdersAndProducts();

            this.addNotification({
                text: result.message,
                type: 'success'
            });
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }
    };

    onEditOrder = ({ orderID }) => {
        const order = this.#orders.find(o => o.orderID === orderID);
        if (!order) return;

        const editModal = document.getElementById('modal-edit-order');
        editModal.querySelector('#edit-order-id').value = orderID;
        editModal.querySelector('#edit-order-name').value = order.customerName;

        const d = new Date(order.orderDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        editModal.querySelector('#edit-order-date').value = `${yyyy}-${mm}-${dd}`;

        const saveBtn = editModal.querySelector('.modal-edit-ok-btn');
        const cancelBtn = editModal.querySelector('.modal-edit-cancel-btn');

        const onSave = async () => {
            try {
                const customerName = editModal.querySelector('#edit-order-name').value;
                const newDate = new Date(editModal.querySelector('#edit-order-date').value).getTime();

                await AppModel.updateOrder({ orderID, customerName, orderDate: newDate });

                order.updateData({ customerName, orderDate: newDate });

                const orderElement = document.getElementById(orderID);
                if (orderElement) {
                    const nameElement = orderElement.querySelector('.order__customer-name');
                    if (nameElement) {
                        nameElement.textContent = customerName;
                    }

                    const dateElement = orderElement.querySelector('.order__date');
                    if (dateElement) {
                        dateElement.textContent = new Date(newDate).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                }

                editModal.close();
                this.addNotification({
                    text: `Заказ обновлён успешно`,
                    type: 'success'
                });
            } catch (err) {
                this.addNotification({ 
                    text: err.message, 
                    type: 'error' 
                });
            }

            saveBtn.removeEventListener('click', onSave);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onCancel = () => {
            editModal.close();
            saveBtn.removeEventListener('click', onSave);
            cancelBtn.removeEventListener('click', onCancel);
        };

        saveBtn.addEventListener('click', onSave);
        cancelBtn.addEventListener('click', onCancel);

        editModal.showModal();
    };

        onDropPosition = async (evt) => {
            evt.stopPropagation();
            const destOrderElement = evt.currentTarget;
            destOrderElement.classList.remove('order_droppable');
    
            const movedPositionID = localStorage.getItem('movedPositionID');
            const srcOrderID = localStorage.getItem('srcOrderID');
            const destOrderID = destOrderElement.getAttribute('id');
    
            localStorage.setItem('movedPositionID', '');
            localStorage.setItem('srcOrderID', '');
    
            if (srcOrderID === destOrderID) return;
    
            try {
                await AppModel.movePosition({
                    positionID: movedPositionID,
                    srcOrderID,
                    destOrderID
                });
                await this.reloadOrdersAndProducts();
    
                this.addNotification({
                    text: `Позиция успешно перемещена`,
                    type: 'success'
                });
            } catch (err) {
                this.addNotification({ text: err.message, type: 'error' });
                console.error(err);
            }
        };

    onNextDay = async () => {
        try {
            this.#currentDate.setDate(this.#currentDate.getDate() + 1);

            const yyyy = this.#currentDate.getFullYear();
            const mm = String(this.#currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(this.#currentDate.getDate()).padStart(2, '0');
            const isoDateStr = `${yyyy}-${mm}-${dd}`;

            const result = await AppModel.processDailyUpdate({ dateStr: isoDateStr });

            document.getElementById('current-date').textContent =
                `${this.#currentDate.toLocaleDateString()}`;

            this.#products = result.products;
            this.#orders.forEach(o => {
                document.getElementById(o.orderID)?.remove();
            });
            this.#orders = [];

            for (const order of result.orders) {
                const orderComp = new Tasklist({
                    orderID: order.orderID,
                    customerName: order.customerName,
                    orderDate: order.orderDate,
                    onDropPosition: this.onDropPosition,
                    addNotification: this.addNotification,
                    availableProducts: result.products,
                    onDeleteOrder: this.onDeleteOrder,
                    onEditOrder: this.onEditOrder
                });
                this.#orders.push(orderComp);
                orderComp.render();

                for (const pos of order.positions) {
                    orderComp.addNewPosition({
                        positionID: pos.positionID,
                        productName: pos.productName,
                        quantity: pos.quantity,
                        productID: pos.productID
                    });
                }
            }

            this.initModals();
            this.addNotification({
                text: result.message,
                type: 'success'
            });
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }
    };

    onAddPosition = async () => {
        const addPositionModal = document.getElementById('modal-add-position');
        const productSelect = addPositionModal.querySelector('#product-select');
        const quantityInput = addPositionModal.querySelector('#product-quantity');

        const positionID = crypto.randomUUID();
        const productID = productSelect.value;
        const quantity = Number(quantityInput.value);

        if (isNaN(quantity) || quantity <= 0) {
            this.addNotification({
                text: 'Ошибка: количество должно быть положительным числом!',
                type: 'error'
            });
            return;
        }
        
        const orderID = localStorage.getItem('addPositionOrderID');

        try {
            await AppModel.addPosition({ positionID, quantity, orderID, productID });

            const product = this.#products.find(p => p.id === productID);
            if (product) {
                product.stock_quantity -= quantity;
            }

            const order = this.#orders.find(o => o.orderID === orderID);
            order.addNewPosition({
                positionID,
                productName: product?.name || 'Неизвестно',
                quantity,
                productID
            });

            this.addNotification({
                text: `Позиция "${product?.name}" успешно добавлена в заказ`,
                type: 'success'
            });
            addPositionModal.close();
        } catch (err) {
            addPositionModal.close();
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        } finally {
            productSelect.value = '';
            quantityInput.value = '';
            this.initModals();
        }
    };

    initModals() {
        const addPositionModal = document.getElementById('modal-add-position');
        if (!addPositionModal) return;

        const productSelect = addPositionModal.querySelector('#product-select');
        const addOkBtn = addPositionModal.querySelector('.modal-ok-btn');
        const addCancelBtn = addPositionModal.querySelector('.modal-cancel-btn');

        productSelect.innerHTML = '';
        this.#products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (в наличии: ${product.stock_quantity})`;
            productSelect.appendChild(option);
        });

        addOkBtn.replaceWith(addOkBtn.cloneNode(true));
        addCancelBtn.replaceWith(addCancelBtn.cloneNode(true));

        const newOkBtn = addPositionModal.querySelector('.modal-ok-btn');
        const newCancelBtn = addPositionModal.querySelector('.modal-cancel-btn');

        newOkBtn.addEventListener('click', this.onAddPosition);
        newCancelBtn.addEventListener('click', () => addPositionModal.close());

        const deletePositionModal = document.getElementById('modal-delete-position');
        if (!deletePositionModal) return;
        const deleteOkBtn = deletePositionModal.querySelector('.modal-ok-btn');
        const deleteCancelBtn = deletePositionModal.querySelector('.modal-cancel-btn');

        deleteOkBtn.replaceWith(deleteOkBtn.cloneNode(true));
        deleteCancelBtn.replaceWith(deleteCancelBtn.cloneNode(true));

        const freshDeleteOkBtn = deletePositionModal.querySelector('.modal-ok-btn');
        const freshDeleteCancelBtn = deletePositionModal.querySelector('.modal-cancel-btn');

        freshDeleteOkBtn.addEventListener('click', () => {
            const positionID = localStorage.getItem('deletePositionID');
            if (positionID) this.deletePosition({ positionID });
            deletePositionModal.close();
        });
        freshDeleteCancelBtn.addEventListener('click', () => {
            deletePositionModal.close();
        });
    }

    initNotifications() {
        const notifications = document.getElementById('notifications');
        notifications.show();
    }

    addNotification = ({ text, type }) => {
        const notifications = document.getElementById('notifications');
        const notificationID = crypto.randomUUID();

        const notification = document.createElement('div');
        notification.classList.add(
            'notification',
            type === 'success' ? 'notification-success' : 'notification-error'
        );
        notification.id = notificationID;
        notification.textContent = text;

        notifications.appendChild(notification);
        setTimeout(() => {
            document.getElementById(notificationID)?.remove();
        }, 5000);
    };

    async init() {
        document.querySelector('.order-adder__btn').addEventListener('click', (event) => {
            event.target.style.display = 'none';
            const addForm = document.querySelector('.order-adder__form');
            addForm.style.display = 'flex';
        });
        document.querySelector('.order-adder__submit').addEventListener('click', this.onCreateOrder);

        document.querySelector('.next-day-btn').addEventListener('click', this.onNextDay);
        document.addEventListener('keydown', this.onEscapeKeydown);

        this.initNotifications();

        try {
            const { orders, products } = await AppModel.getOrders();
            this.#products = products;

            for (const order of orders) {
                const orderComp = new Tasklist({
                    orderID: order.orderID,
                    customerName: order.customerName,
                    orderDate: order.orderDate,
                    onDropPosition: this.onDropPosition,
                    addNotification: this.addNotification,
                    availableProducts: products,
                    onDeleteOrder: this.onDeleteOrder,
                    onEditOrder: this.onEditOrder
                });
                this.#orders.push(orderComp);
                orderComp.render();

                for (const pos of order.positions) {
                    orderComp.addNewPosition({
                        positionID: pos.positionID,
                        productName: pos.productName,
                        quantity: pos.quantity,
                        productID: pos.productID
                    });
                }
            }
        } catch (err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }

        this.initModals();
        document.getElementById('current-date').textContent =
            `${this.#currentDate.toLocaleDateString()}`;
    }
}