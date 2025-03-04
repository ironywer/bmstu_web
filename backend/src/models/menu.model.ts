import { Item } from './dish.model';

export interface Menu {
  id: string;
  day: string;
  variant: string;
  dishes: Item[];
}
