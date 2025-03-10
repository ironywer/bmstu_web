export default class Task {
    #positionID = '';
    #productName = '';
    #quantity = 0;
    #orderID = '';
    #productID = '';
    #onUpdateQuantity = null;
  
    constructor({ positionID = null, productName, quantity, orderID, productID, onUpdateQuantity }) {
        this.#positionID = positionID || crypto.randomUUID();
        this.#productName = productName;
        this.#quantity = quantity;
        this.#orderID = orderID;
        this.#productID = productID;
        this.#onUpdateQuantity = onUpdateQuantity;
    }
  
    get positionID() { return this.#positionID; }
    get productName() { return this.#productName; }
    get quantity() { return this.#quantity; }
    get orderID() { return this.#orderID; }
    get productID() { return this.#productID; }

    updateQuantity = async (newQuantity) => {
        if (this.#onUpdateQuantity) {
            const success = await this.#onUpdateQuantity({
                positionID: this.#positionID,
                quantity: newQuantity,
                currentQuantity: this.#quantity
            });
            
            if (success) {
                this.#quantity = newQuantity;
                // Улучшаем поиск элемента и обновление UI
                const positionElement = document.getElementById(this.#positionID);
                if (positionElement) {
                    const quantityElement = positionElement.querySelector('.position-item__quantity');
                    if (quantityElement) {
                        quantityElement.textContent = `Количество: ${this.#quantity}`;
                    }
                }
                return true;
            }
        }
        return false;
    };

    render() {
        const liElement = document.createElement('li');
        liElement.classList.add('order-position', 'position-item');
        liElement.id = this.#positionID;
        liElement.draggable = true;
  
        liElement.addEventListener('dragstart', (evt) => {
            evt.target.classList.add('position-item_selected');
            localStorage.setItem('movedPositionID', this.#positionID);
            localStorage.setItem('srcOrderID', this.#orderID);
            console.log('Dragstart: positionID =', this.#positionID, 'srcOrderID =', this.#orderID);
        });
  
        liElement.addEventListener('dragend', (evt) => {
            evt.target.classList.remove('position-item_selected');
        });
  
        const productInfo = document.createElement('div');
        productInfo.classList.add('position-item__info');
  
        const productNameEl = document.createElement('span');
        productNameEl.classList.add('position-item__name');
        productNameEl.textContent = this.#productName;
        productInfo.appendChild(productNameEl);
  
        const quantityInfo = document.createElement('span');
        quantityInfo.classList.add('position-item__quantity');
        quantityInfo.textContent = `Количество: ${this.#quantity}`;
        productInfo.appendChild(quantityInfo);
  
        liElement.appendChild(productInfo);
  
        const controls = document.createElement('div');
        controls.classList.add('position-item__controls');
  
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.classList.add('position-control-btn', 'edit-icon');
        editBtn.title = 'Изменить количество';
        editBtn.textContent = 'Изменить';
        editBtn.addEventListener('click', () => {
            const newQuantity = prompt('Введите новое количество:', this.#quantity);
            if (newQuantity && !isNaN(newQuantity) && Number(newQuantity) > 0) {
                this.updateQuantity(Number(newQuantity));
            }
        });

        controls.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('position-control-btn', 'delete-icon');
        deleteBtn.title = 'Удалить позицию';
        deleteBtn.textContent = 'Удалить';
  
        deleteBtn.addEventListener('click', () => {
            localStorage.setItem('deletePositionID', this.#positionID);
            const deleteModal = document.getElementById('modal-delete-position');
            deleteModal.querySelector('.modal__question').textContent =
                `Удалить позицию "${this.#productName}" (${this.#quantity} шт.)?`;
            deleteModal.showModal();
        });
  
        controls.appendChild(deleteBtn);
        liElement.appendChild(controls);
  
        return liElement;
    }
}