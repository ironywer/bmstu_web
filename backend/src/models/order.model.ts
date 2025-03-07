import { Item } from './item.model';

export interface Order {
  id: string;
  customerName: string;
  orderDate: Date;
  items: Array<{
    item: Item;
    quantity: number;
  }>;
}
