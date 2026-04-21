export interface IRepository<T, CreateDTO, Filters = Record<string, unknown>> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Filters): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: Partial<CreateDTO>): Promise<T>;
  delete(id: string): Promise<void>;
}
