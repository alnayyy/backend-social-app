import { Injectable } from '@nestjs/common';

type Item = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
  createdBy?: number;
};

@Injectable()
export class ItemsService {
  private items: Item[] = [];
  private nextId = 1;

  findAll(): Item[] {
    return this.items;
  }

  create(data: { title: string; description?: string }, userId?: number): Item {
    const item: Item = {
      id: this.nextId++,
      title: data.title,
      description: data.description ?? null,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    this.items.push(item);

    return item;
  }

  findById(id: number): Item | null {
    return this.items.find((i) => i.id === id) ?? null;
  }

  update(id: number, data: { title?: string; description?: string }, userId?: number): Item | null {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = this.items[index];
    const updated: Item = {
      ...current,
      title: data.title ?? current.title,
      description: data.description ?? current.description,
    };

    this.items[index] = updated;

    return updated;
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
