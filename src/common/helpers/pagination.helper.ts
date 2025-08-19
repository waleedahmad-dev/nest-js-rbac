import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../dto/paginated-response.dto';

export class PaginationHelper {
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    searchFields?: string[],
    relations?: string[],
    alias?: string,
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = repository.createQueryBuilder(alias || 'entity');

    // Add relations
    if (relations) {
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(
          `${alias || 'entity'}.${relation}`,
          relation,
        );
      });
    }

    // Add search functionality
    if (search && searchFields && searchFields.length > 0) {
      const searchConditions = searchFields
        .map((field) => `${alias || 'entity'}.${field} LIKE :search`)
        .join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${search}%` });
    }

    // Add sorting
    if (sortBy) {
      queryBuilder.orderBy(`${alias || 'entity'}.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy(`${alias || 'entity'}.createdAt`, 'DESC');
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }

  static async paginateQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }
}
