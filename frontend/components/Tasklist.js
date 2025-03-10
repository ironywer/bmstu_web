import Task from './Task.js';
import AppModel from '../model/AppModel.js';

export default class Tasklist {
    #positions = [];
    #customerName = '';
    #orderID = null;
    #orderDate = null;
    #availableProducts = [];
    #addNotification = null;

    constructor({
        orderID = null,
        customerName,
        orderDate,
        onDropPosition,
        addNotification,
        availableProducts = [],
        onDeleteOrder,
        onEditOrder
    }) {
        this.#orderID = orderID || crypto.randomUUID();
        this.#customerName = customerName;
        this.#orderDate = orderDate;
        this.onDropPosition = onDropPosition;
        this.#addNotification = addNotification;
        this.#availableProducts = availableProducts;
        this.onDeleteOrder = onDeleteOrder;
        this.onEditOrder = onEditOrder;
    }

    get orderID() { return this.#orderID; }
    get orderDate() { return this.#orderDate; }
    get customerName() { return this.#customerName; }
    get positions() { return this.#positions; }

    updateData = ({ customerName, orderDate }) => {
        this.#customerName = customerName;
        this.#orderDate = orderDate;
    }

    handleUpdateQuantity = async ({ positionID, quantity, currentQuantity }) => {
        try {
            const position = this.getPositionById({ positionID });
            if (!position) {
                throw new Error('Position not found');
            }
    
            // Проверяем наличие товара
            const product = this.#availableProducts.find(p => p.id === position.productID);
            if (!product) {
                throw new Error('Product not found');
            }
    
            // Вычисляем, сколько нужно дополнительного товара
            const quantityDiff = quantity - currentQuantity;
            if (quantityDiff > 0 && product.stock_quantity < quantityDiff) {
                throw new Error(`Недостаточно товара на складе. Доступно: ${product.stock_quantity}`);
            }
    
            await AppModel.updatePosition({ 
                positionID, 
                quantity 
            });
            
            // Обновляем количество на складе в локальных данных
            if (product) {
                product.stock_quantity -= quantityDiff;
            }
    
            // Обновляем select в модальном окне
            const productSelect = document.getElementById('product-select');
            if (productSelect) {
                const option = productSelect.querySelector(`option[value="${product.id}"]`);
                if (option) {
                    option.textContent = `${product.name} (в наличии: ${product.stock_quantity})`;
                }
            }
    
            this.#addNotification({
                text: 'Количество товара успешно обновлено',
                type: 'success'
            });
    
            return true;
        } catch (err) {
            this.#addNotification({
                text: err.message,
                type: 'error'
            });
            return false;
        }
    }

    pushPosition = ({ position }) => this.#positions.push(position);

    getPositionById = ({ positionID }) =>
        this.#positions.find(pos => pos.positionID === positionID);

    deletePosition = ({ positionID }) => {
        const idx = this.#positions.findIndex(pos => pos.positionID === positionID);
        if (idx === -1) return null;
        const [deleted] = this.#positions.splice(idx, 1);
        return deleted;
    };

    async addNewPosition({ positionID, productName, quantity, productID }) {
        const product = this.#availableProducts.find(p => p.id === productID);
        if (!product) {
            this.#addNotification({
                text: `Товар (ID: ${productID}) не найден`,
                type: 'error'
            });
            return;
        }

        const newTask = new Task({
            positionID,
            productName,
            quantity,
            orderID: this.#orderID,
            productID,
            onUpdateQuantity: this.handleUpdateQuantity
        });

        this.#positions.push(newTask);

        const positionElement = newTask.render();
        const positionsList = document.querySelector(
            `[id="${this.#orderID}"] .order-positions-list`
        );
        positionsList.appendChild(positionElement);
    }

    render() {
        const orderElement = document.createElement('li');
        orderElement.classList.add('orders-list__item', 'order');
        orderElement.id = this.#orderID;
    
        orderElement.addEventListener('dragstart', () => {
            localStorage.setItem('srcOrderID', this.#orderID);
        });
        
        orderElement.addEventListener('dragover', (evt) => {
            evt.preventDefault();
            orderElement.classList.add('order_droppable');
        });
        orderElement.addEventListener('dragleave', () => {
            orderElement.classList.remove('order_droppable');
        });
        orderElement.addEventListener('drop', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            orderElement.classList.remove('order_droppable');
            console.log('Drop событие сработало в заказе с id:', orderElement.getAttribute('id'));
            this.onDropPosition(evt);
        });

        const header = document.createElement('div');
        header.classList.add('order__header');

        const customerNameEl = document.createElement('h2');
        customerNameEl.classList.add('order__customer-name');
        customerNameEl.textContent = this.#customerName;
        header.appendChild(customerNameEl);

        const editOrderBtn = document.createElement('button');
        editOrderBtn.type = 'button';
        editOrderBtn.classList.add('order-control-btn', 'edit-icon');
        editOrderBtn.title = 'Редактировать заказ';
        editOrderBtn.textContent = 'Изменить';
        editOrderBtn.addEventListener('click', () => {
            this.onEditOrder({ orderID: this.#orderID });
        });
        header.appendChild(editOrderBtn);

        const deleteOrderBtn = document.createElement('button');
        deleteOrderBtn.type = 'button';
        deleteOrderBtn.classList.add('order-control-btn', 'delete-icon');
        deleteOrderBtn.title = 'Удалить заказ';
        deleteOrderBtn.textContent = 'Удалить';
        deleteOrderBtn.addEventListener('click', () => {
            this.onDeleteOrder({ orderID: this.#orderID });
        });
        header.appendChild(deleteOrderBtn);

        orderElement.appendChild(header);

        const dateEl = document.createElement('div');
        dateEl.classList.add('order__date');
        dateEl.textContent = new Date(this.#orderDate).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        orderElement.appendChild(dateEl);

        const positionsList = document.createElement('ul');
        positionsList.classList.add('order__positions-list', 'order-positions-list');
        orderElement.appendChild(positionsList);

        const addPositionBtn = document.createElement('button');
        addPositionBtn.type = 'button';
        addPositionBtn.classList.add('order__add-position-btn');
        addPositionBtn.textContent = '+ Добавить товар';
        addPositionBtn.addEventListener('click', () => {
            localStorage.setItem('addPositionOrderID', this.#orderID);
            document.getElementById('modal-add-position').showModal();
        });
        orderElement.appendChild(addPositionBtn);

        const adderElement = document.querySelector('.order-adder');
        adderElement.parentElement.insertBefore(orderElement, adderElement);
    }
}