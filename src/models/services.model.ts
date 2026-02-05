export interface CreateServiceCategoryPayload {
  name: string;
  description?: string;
}

export interface ServiceCategory extends CreateServiceCategoryPayload {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ServicePayload {
  name: string;
  description: string;
  price: number;
  durationMinutes?: number;
  categoryId: string;
}

export interface ServiceItem extends ServicePayload {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  category?: ServiceCategory;
}
